# lost.pet

A project to help people find their lost pets.

## AT Protocol lexicons

This repository defines the public record schema for lost.pet listings:

- `pet.lost.listing` in `lexicons/pet/lost/listing.json`
- shared reusable definitions in `lexicons/pet/lost/defs.json`

The listing record supports missing-pet reports, found-pet reports, and sightings. It includes optional self-labels via `com.atproto.label.defs#selfLabels` so atproto moderation and content-warning tooling can operate on these records.

Use `pet.lost.listing` with TID record keys:

```text
at://<did>/pet.lost.listing/<tid>
```

## Commands

```sh
bun install
bun run validate:lexicons
bun run build
```

For local development, start Astro in background mode:

```sh
bun astro dev --background
```
