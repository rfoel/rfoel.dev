Até pouco tempo, o deploy do rfoel.dev era um `sst deploy` rodado da minha máquina, com o perfil da AWS que vive no meu `~/.aws`. Funciona, mas depende de mim: de eu lembrar, de estar no computador certo e de a branch local estar igual à `main`.

Agora cada push na `main` vai para produção sozinho, pelo GitHub Actions. E nenhuma chave da AWS foi parar no GitHub. Quem faz isso é o OIDC.

## O problema das chaves

O jeito antigo de dar acesso à AWS para um CI é criar um usuário no IAM, gerar uma access key e guardar no GitHub como secret. Essa chave não expira. Se ela vazar num log, num fork ou num print, quem pegar tem acesso à conta até alguém perceber e revogar. E alguém precisa lembrar de trocar a chave de tempos em tempos.

## Como o OIDC resolve

Com OIDC, a chave não existe. A troca acontece em cada execução:

1. O GitHub Actions gera um token assinado para o job, que diz de onde ele vem: qual repositório, qual branch, qual environment.
2. A AWS confia no emissor desses tokens (`token.actions.githubusercontent.com`), cadastrado uma vez na conta como provedor OIDC.
3. O job pede para assumir um papel do IAM mostrando esse token. A AWS confere a assinatura e as condições do papel e devolve credenciais temporárias, que valem uma hora.

Quem decide se o job entra é a política de confiança do papel. É ali que a segurança mora.

## O papel, no próprio sst.config.ts

O papel de deploy é criado pelo próprio SST, junto com o site, só no stage de produção:

```ts
// O provedor OIDC do GitHub já existe na conta (criado por outro projeto), então só é procurado.
const github = aws.iam.getOpenIdConnectProviderOutput({
  url: "https://token.actions.githubusercontent.com",
});

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
                "repo:rfoel@19496473/rfoel.dev@1185670554:environment:production",
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

Três detalhes importam aqui.

**O provedor OIDC é um só por conta.** Ele foi criado uma vez, pelo primeiro projeto que fez isso (o saci.cc). Os outros só procuram o que já existe com `getOpenIdConnectProviderOutput`. Se cada projeto tentasse criar o seu, o segundo deploy falharia.

**O papel tem `AdministratorAccess`.** Parece muito, mas o SST cria e muda todo tipo de recurso, inclusive papéis do IAM, e uma política mais apertada teria que ser ajustada a cada tipo de recurso novo no projeto. A proteção não está no que o papel pode fazer, e sim em quem pode assumir: só jobs que rodam no environment `production` deste repositório.

**O `sub` usa os ids numéricos.** O formato padrão do GitHub seria `repo:rfoel/rfoel.dev:environment:production`, com nomes. Se eu renomeasse a conta ou apagasse o repositório, outra pessoa poderia criar um com o mesmo nome e passar na condição. Com o sujeito imutável, o `sub` leva o id do dono e do repositório, que nunca são reaproveitados. Isso se liga por repositório:

```sh
gh api -X PUT repos/rfoel/rfoel.dev/actions/oidc/customization/sub \
  -F use_default=true -F use_immutable_subject=true
```

## O environment de produção

A condição fala em `environment:production`, então o job precisa rodar num environment com esse nome. No GitHub, eu criei o environment e deixei só a `main` fazer deploy nele:

```sh
gh api -X PUT repos/rfoel/rfoel.dev/environments/production \
  --input - <<< '{"deployment_branch_policy": {"protected_branches": false, "custom_branch_policies": true}}'

gh api -X POST repos/rfoel/rfoel.dev/environments/production/deployment-branch-policies \
  -f name=main -f type=branch
```

Com isso, um job de outra branch nem chega a receber um token com esse `sub`. Um pull request de fora não tem como fazer deploy.

## O workflow

São dois jobs. O primeiro confere formato, lint, tipos e build. O segundo só roda se o primeiro passar:

```yaml
deploy:
  name: Deploy de produção
  needs: check
  # Desligado até existir a variável AWS_DEPLOY_ROLE: o DeployRole sai do primeiro deploy feito à mão
  if: vars.AWS_DEPLOY_ROLE != ''
  runs-on: ubuntu-latest
  timeout-minutes: 30
  environment: production
  # Um deploy por vez; um push mais novo espera em vez de cancelar um pela metade
  concurrency:
    group: deploy-production
    cancel-in-progress: false
  permissions:
    id-token: write
    contents: read
  steps:
    - uses: actions/checkout@v5
    - uses: voidzero-dev/setup-vp@v1
      with:
        cache: true
    - uses: aws-actions/configure-aws-credentials@v6
      with:
        role-to-assume: ${{ vars.AWS_DEPLOY_ROLE }}
        aws-region: us-east-1
    - run: vp exec sst deploy --stage production
```

O `id-token: write` é o que deixa o job pedir o token OIDC. Sem ele, o `configure-aws-credentials` não tem o que trocar. O `concurrency` com `cancel-in-progress: false` evita que dois pushes seguidos façam deploy ao mesmo tempo, ou que um cancele o outro no meio de uma mudança de infraestrutura.

## O ovo e a galinha

O papel é criado pelo `sst deploy`, mas o CI precisa do papel para rodar o `sst deploy`. Então o primeiro deploy com o papel é feito à mão, da minha máquina. O SST imprime o ARN no fim:

```
deployRole: arn:aws:iam::123456789012:role/DeployRole-dd09024
```

Esse ARN vira uma variável do repositório, e o job de deploy liga sozinho:

```sh
gh variable set AWS_DEPLOY_ROLE --body "arn:aws:iam::123456789012:role/DeployRole-dd09024"
```

O `if: vars.AWS_DEPLOY_ROLE != ''` existe por isso: enquanto a variável não existe, o workflow roda só o check, sem falhar no deploy.

## Onde eu tropecei

**A região.** O app estava na AWS desde o primeiro deploy, em `us-east-1`. Mas o `sst.config.ts` não dizia a região: ela vinha do meu perfil local. Meus outros projetos usam `sa-east-1`. Se o CI fizesse deploy em outra região, o SST não acharia o estado do app e tentaria criar tudo do zero, brigando pelo mesmo domínio. A região passou a ficar fixa na config:

```ts
providers: {
  // no GitHub Actions as credenciais vêm do OIDC (DeployRole), não do perfil
  aws: {
    version: "7.20.0",
    region: "us-east-1" as const,
    profile: process.env.GITHUB_ACTIONS ? undefined : "default",
  },
},
```

Antes de qualquer deploy, rodei `sst diff --stage production`. Ele mostra o que mudaria sem mudar nada, e a lista tinha só o `DeployRole`, a política dele e os arquivos do site. Nada de CloudFront ou bucket sendo recriado.

**Os tipos do SST no check.** O `vp check` do CI confere os tipos do `sst.config.ts`, e esses tipos só existem depois que o SST instala os providers. No CI, um `vp exec sst install` antes do check resolve. Com os tipos no lugar, apareceu um erro que estava escondido: nesta versão do SST, um provider com opções precisa de `version`. Fixei na mesma versão que o app já usava, a `7.20.0`, para o deploy não atualizar nada sem eu pedir.

## O resultado

Agora o caminho é: commit, push na `main`, o check passa e o deploy sai. Na AWS, nenhum usuário do IAM com chave para o CI. No GitHub, nenhum secret da AWS, só o ARN de um papel que não serve para nada fora do environment de produção deste repositório.
