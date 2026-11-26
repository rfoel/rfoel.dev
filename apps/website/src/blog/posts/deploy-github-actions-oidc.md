O jeito mais comum de dar acesso à AWS para um CI ainda é criar um usuário no IAM, gerar uma access key e guardar no GitHub como secret. Essa chave não expira. Se ela vazar num log, num fork ou num print, quem pegar tem acesso à conta até alguém perceber e revogar. E alguém precisa lembrar de trocar a chave de tempos em tempos.

Com OIDC, essa chave não existe. O GitHub Actions prova para a AWS de onde o job vem, e a AWS devolve credenciais que valem uma hora. Este post mostra o caminho inteiro, com os exemplos em [SST](https://sst.dev), mas a ideia é a mesma no Terraform, no CDK ou no console.

## Como funciona

1. O GitHub Actions gera um token assinado para cada job. O token diz de onde ele vem: qual repositório, qual branch, qual environment.
2. A AWS confia no emissor desses tokens (`token.actions.githubusercontent.com`), cadastrado na conta como provedor OIDC.
3. O job pede para assumir um papel do IAM mostrando o token. A AWS confere a assinatura e as condições do papel e devolve credenciais temporárias.

Quem decide se o job entra é a política de confiança do papel. É ali que a segurança mora.

## 1. O provedor OIDC

O provedor é um só por conta da AWS. O primeiro projeto que precisar cria:

```ts
const github = new aws.iam.OpenIdConnectProvider("GithubActions", {
  url: "https://token.actions.githubusercontent.com",
  clientIdLists: ["sts.amazonaws.com"],
});
```

Os outros projetos da mesma conta só procuram o que já existe. Se cada um tentasse criar o seu, o segundo deploy falharia, porque a URL já está cadastrada:

```ts
const github = aws.iam.getOpenIdConnectProviderOutput({
  url: "https://token.actions.githubusercontent.com",
});
```

## 2. O papel e a política de confiança

O papel diz quem pode assumi-lo. No SST, dá para criar ele junto com o app, só no stage de produção:

```ts
const deployRole = new aws.iam.Role("DeployRole", {
  maxSessionDuration: 3600,
  assumeRolePolicy: github.arn.apply((arn) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { Federated: arn },
          Action: "sts:AssumeRoleWithWebIdentity",
          Condition: {
            StringEquals: {
              "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
              "token.actions.githubusercontent.com:sub":
                "repo:minha-org@123456/meu-app@987654321:environment:production",
            },
          },
        },
      ],
    }),
  ),
});

new aws.iam.RolePolicyAttachment("DeployAdmin", {
  role: deployRole.name,
  policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
});
```

As duas condições fazem coisas diferentes. O `aud` garante que o token foi pedido para a AWS, e não para outro serviço. O `sub` diz exatamente qual job pode entrar.

**Sobre o `AdministratorAccess`.** Parece muito, mas uma ferramenta como o SST cria e muda todo tipo de recurso, inclusive papéis do IAM. Uma política mais apertada teria que ser ajustada a cada tipo de recurso novo no projeto. Se o seu deploy mexe em pouca coisa, prefira uma política só com o que ele usa. Se não, a proteção fica na confiança: o papel pode muito, mas só um job muito específico consegue assumi-lo.

## 3. O sujeito (sub)

O `sub` padrão do GitHub usa nomes: `repo:minha-org/meu-app:environment:production`. O problema é que nomes mudam. Se a organização for renomeada ou o repositório apagado, outra pessoa pode criar um com o mesmo nome, e o token dela passaria na condição.

O GitHub tem um formato imutável, que leva o id numérico do dono e do repositório: `repo:minha-org@123456/meu-app@987654321:environment:production`. Esses ids nunca são reaproveitados. Ele se liga por repositório:

```sh
gh api -X PUT repos/minha-org/meu-app/actions/oidc/customization/sub \
  -F use_default=true -F use_immutable_subject=true
```

A resposta mostra o prefixo do sujeito com os ids. É ele que vai na política do papel, seguido de `:environment:production`.

## 4. O environment de produção

Com environment no `sub`, o job precisa rodar num environment com esse nome. Crie o environment no GitHub e deixe só a `main` fazer deploy nele:

```sh
gh api -X PUT repos/minha-org/meu-app/environments/production \
  --input - <<< '{"deployment_branch_policy": {"protected_branches": false, "custom_branch_policies": true}}'

gh api -X POST repos/minha-org/meu-app/environments/production/deployment-branch-policies \
  -f name=main -f type=branch
```

Um job de outra branch não roda nesse environment, então não chega a ter um token com esse `sub`. Um pull request não tem como fazer deploy.

## 5. O workflow

Um job de deploy que só roda depois dos testes:

```yaml
deploy:
  needs: check
  # Desligado até existir a variável AWS_DEPLOY_ROLE (ver o passo 6)
  if: vars.AWS_DEPLOY_ROLE != ''
  runs-on: ubuntu-latest
  environment: production
  # Um deploy por vez: um push mais novo espera em vez de cancelar um pela metade
  concurrency:
    group: deploy-production
    cancel-in-progress: false
  permissions:
    id-token: write
    contents: read
  steps:
    - uses: actions/checkout@v5
    - uses: aws-actions/configure-aws-credentials@v6
      with:
        role-to-assume: ${{ vars.AWS_DEPLOY_ROLE }}
        aws-region: us-east-1
    - run: npx sst deploy --stage production
```

Três linhas importam aqui. O `environment: production` é o que põe o environment no `sub` do token. O `id-token: write` deixa o job pedir o token; sem ele, o `configure-aws-credentials` não tem o que trocar. E o `concurrency` com `cancel-in-progress: false` impede que dois pushes seguidos façam deploy ao mesmo tempo, ou que um cancele o outro no meio de uma mudança de infraestrutura.

A região do `aws-region` precisa ser a mesma em que o app já vive. Vale fixar a região também na config do projeto, para o deploy da sua máquina e o do CI caírem sempre no mesmo lugar.

## 6. O primeiro deploy

Se o papel é criado pelo próprio deploy, o CI não tem como fazer o primeiro. Então o primeiro é à mão, com as suas credenciais, e a ferramenta mostra o ARN do papel no fim. No SST, basta devolver ele no `run`:

```ts
return { deployRole: deployRole.arn };
```

Esse ARN vira uma variável do repositório:

```sh
gh variable set AWS_DEPLOY_ROLE --repo minha-org/meu-app \
  --body "arn:aws:iam::123456789012:role/DeployRole-abc1234"
```

O `if: vars.AWS_DEPLOY_ROLE != ''` do workflow existe por isso: enquanto a variável não existe, o deploy fica desligado em vez de falhar. A partir dela, cada push na `main` vai para produção.

## Quando dá erro

- **"Not authorized to perform sts:AssumeRoleWithWebIdentity":** o token não passou na política. Quase sempre é o `sub`: o job não está no environment certo, o formato imutável não foi ligado no repositório, ou os ids estão errados.
- **O `configure-aws-credentials` não consegue credenciais:** falta o `id-token: write` nas permissões do job.
- **O deploy tenta criar tudo do zero:** o CI está numa região diferente da que o app usa.

## Resumo

- Um provedor OIDC por conta da AWS.
- Um papel por app, que só confia no environment `production` do repositório, com o `sub` imutável.
- O environment `production` restrito à `main`.
- No workflow: `environment: production`, `id-token: write` e o `configure-aws-credentials` com o ARN do papel.

No fim, nenhum secret da AWS no GitHub e nenhum usuário do IAM com chave para o CI. Só o ARN de um papel que não serve para nada fora do deploy de produção daquele repositório.
