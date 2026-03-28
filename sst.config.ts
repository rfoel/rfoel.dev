/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "rfoel",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    new sst.aws.StaticSite("Website", {
      path: "apps/website",
      build: {
        command: "vp build",
        output: "dist",
      },
      domain: "rfoel.dev",
    });
  },
});
