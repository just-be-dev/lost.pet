import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "LostPet",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.Bucket("Bucket");
    const site = yield* Cloudflare.Website.StaticSite("Website", {
      command: "bun run build",
      outdir: "dist",
      compatibility: {
        flags: ["nodejs_compat"],
      },
    });


    return {
      bucketName: bucket.bucketName,
      url: site.url,
    };
  }),
);
