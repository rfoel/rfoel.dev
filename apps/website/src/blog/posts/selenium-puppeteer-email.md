O saci.cc é uma API HTTP, então qualquer ferramenta de teste consegue usar: basta criar um endereço, fazer o cadastro com ele e pedir o email. Este guia mostra o Selenium com Python, que fala direto com a API, e o Puppeteer, que usa o pacote `saci.cc` do npm. Para o Playwright e o Cypress, veja o [guia do Playwright](/blog/playwright-email-verification/).

## A chave

A API pede uma chave, e a chave é grátis. Entre com o GitHub na [página da conta](https://saci.cc/account/), crie uma chave e coloque na variável `SACI_API_KEY`. No CI, guarde como secret. As caixas criadas com a sua chave são privadas: só a sua conta lê os emails delas.

## Selenium com Python

Não há pacote para Python, mas a API é pequena. Este arquivo cria uma caixa e espera um email que chegue depois de um momento:

```python
# saci_helpers.py
import os
import time
from datetime import datetime, timezone

import requests

API = "https://saci.cc/api"
saci = requests.Session()
# A chave vem da variável de ambiente SACI_API_KEY
saci.headers["Authorization"] = "Bearer " + os.environ["SACI_API_KEY"]


def create_inbox() -> str:
    response = saci.post(f"{API}/addresses")
    response.raise_for_status()
    return response.json()["address"]


def wait_for_email(address: str, after: datetime, timeout: float = 60) -> dict:
    """Espera um email recebido depois de `after` e devolve o resumo dele."""
    since = after.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        response = saci.get(f"{API}/addresses/{address}/emails", params={"wait": 25, "after": since}, timeout=35)
        if response.status_code == 429:  # passou do limite por minuto: espera e tenta de novo
            time.sleep(float(response.headers.get("Retry-After", 5)))
            continue
        response.raise_for_status()
        # A lista vem inteira, do mais novo para o mais antigo
        for email in response.json()["emails"]:
            if datetime.fromisoformat(email["receivedAt"].replace("Z", "+00:00")) > after:
                return email
    raise TimeoutError(f"Nenhum email chegou em {address} em {timeout} s")
```

O `wait=25` pede para a API segurar a requisição até chegar um email, por até 25 segundos. Assim o teste não fica consultando a caixa sem parar e gasta só algumas requisições por espera. O `after` faz a API esperar um email recebido depois daquele momento, e não devolver na hora um email antigo que já estava na caixa.

Com isso, um teste do pytest com o Selenium fica assim:

```python
from datetime import datetime, timezone

from selenium import webdriver
from selenium.webdriver.common.by import By

from saci_helpers import create_inbox, wait_for_email


def test_signup_with_verification_code():
    driver = webdriver.Chrome()
    try:
        address = create_inbox()
        started = datetime.now(timezone.utc)

        driver.get("https://your-app.com/signup")
        driver.find_element(By.NAME, "email").send_keys(address)
        driver.find_element(By.NAME, "password").send_keys("correct horse battery staple")
        driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()

        # Espera o email do cadastro
        email = wait_for_email(address, after=started)
        # O saci.cc já tira o código do email
        driver.find_element(By.NAME, "code").send_keys(email["verificationCode"])
        driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
        assert "Welcome" in driver.page_source
    finally:
        driver.quit()
```

O resumo de cada email já traz `verificationCode` e `verificationLink`, que o saci.cc extrai do texto. Se o seu app manda um link, faça `driver.get(email["verificationLink"])`. Para o email inteiro, com HTML, texto, todos os links e anexos, peça `GET /addresses/{address}/emails/{messageId}`. A [documentação da API](https://saci.cc/docs/) lista todos os campos.

## Puppeteer

No Node, o pacote `saci.cc` faz a espera por você:

```bash
npm install --save-dev saci.cc
```

```js
import puppeteer from "puppeteer";
import { createInbox } from "saci.cc";

// A chave vem da variável de ambiente SACI_API_KEY
const inbox = await createInbox();
const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto("https://your-app.com/signup");
await page.type("input[name=email]", inbox.address);
await page.type("input[name=password]", "correct horse battery staple");
await page.click("button[type=submit]");

const code = await inbox.waitForCode({ from: "your-app.com" });
await page.type("input[name=code]", code);
await Promise.all([page.waitForNavigation(), page.click("button[type=submit]")]);

// Se o email traz um link em vez de código:
// const link = await inbox.waitForLink({ match: "/confirm" });
// await page.goto(link);

await browser.close();
```

`waitForCode` espera até 60 segundos e lança `SaciTimeoutError` se nada chegar. O mesmo código funciona no WebdriverIO, no Selenium para JavaScript ou em qualquer script em Node: o cliente não depende do navegador.

## Cuidados que valem para qualquer ferramenta

- **Uma caixa por teste.** Testes em paralelo que dividem uma caixa leem o email um do outro.
- **Marque o momento antes da ação**, não depois. Se o email chegar rápido, um `after` marcado depois do clique pode deixá-lo de fora.
- **Dê tempo ao teste.** O email costuma chegar em poucos segundos, mas um timeout de 90 segundos evita falsos negativos com provedores lentos.
- **Respeite o limite.** Todas as chaves de uma conta dividem 120 requisições por minuto no Free. Com o `wait=25`, cada teste esperando gasta umas 3 por minuto.

## Resumindo

- Crie uma chave grátis e use em `SACI_API_KEY`.
- Em Python, `POST /addresses` e depois `GET /addresses/{address}/emails?wait=25&after=...`.
- No Node, `createInbox()` e `waitForCode()` ou `waitForLink()`.
- Para rodar no CI, veja o [guia do GitHub Actions](/blog/github-actions-email-tests/).
