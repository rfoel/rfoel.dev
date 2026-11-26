/// <reference path="./.sst/platform/config.d.ts" />

// Conta pessoal (perfil "default"). O app vive em us-east-1 desde o primeiro deploy, então a
// região fica fixa aqui: sem ela, cada máquina usaria a região do próprio perfil.
export default $config({
  app(input) {
    return {
      name: "rfoel",
      removal: input?.stage === "production" ? ("retain" as const) : ("remove" as const),
      protect: ["production"].includes(input?.stage),
      home: "aws" as const,
      providers: {
        // no GitHub Actions as credenciais vêm do OIDC (DeployRole), não do perfil
        aws: {
          // a versão que o app já usa (o tipo do SST pede uma quando o provider tem opções)
          version: "7.20.0",
          region: "us-east-1" as const,
          profile: process.env.GITHUB_ACTIONS ? undefined : "default",
        },
      },
    };
  },
  async run() {
    const isProd = $app.stage === "production";

    const site = new sst.aws.StaticSite("Website", {
      path: "apps/website",
      build: {
        command: "vp run build",
        output: "dist",
      },
      // Endereço que não existe: a 404.html (prerender.mjs, com noindex) em vez da home. É o
      // indexPage, que a função do CloudFront serve com status 200, e não o errorPage: sem Router,
      // o CloudFront busca a página de erro na origem fixa da distribuição, que no SST é só um
      // placeholder, e responde 502.
      indexPage: "404.html",
      domain: isProd ? "rfoel.dev" : undefined,
    });

    // O Release (.github/workflows/release.yml) faz o deploy de produção com este papel. O SST cria e
    // muda todo tipo de recurso (papéis do IAM inclusive), então ele tem AdministratorAccess; quem
    // protege é a confiança: só jobs no environment "production" do repositório.
    // O provedor OIDC do GitHub já existe na conta (criado pelo saci.cc), então só é procurado.
    let deployRole: aws.iam.Role | undefined;
    if (isProd) {
      const github = aws.iam.getOpenIdConnectProviderOutput({
        url: "https://token.actions.githubusercontent.com",
      });
      deployRole = new aws.iam.Role("DeployRole", {
        description:
          "rfoel.dev production deploys (GitHub Actions, rfoel/rfoel.dev, production environment)",
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
                    // sujeito imutável do GitHub (dono e repositório com os ids numéricos); com
                    // environment, o sujeito leva o environment e não a branch
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
    }

    return {
      url: site.url,
      // Para a variável AWS_DEPLOY_ROLE no GitHub (release.yml)
      deployRole: deployRole?.arn,
    };
  },
});
