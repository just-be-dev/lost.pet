import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Lexicons, parseLexiconDoc } from '@atproto/lexicon';

const lexiconRoot = new URL('../lexicons/', import.meta.url);

const externalLexicons = [
  {
    lexicon: 1,
    id: 'com.atproto.label.defs',
    defs: {
      selfLabels: {
        type: 'object',
        description: 'Metadata tags on an atproto record, published by the author within the record.',
        required: ['values'],
        properties: {
          values: {
            type: 'array',
            items: { type: 'ref', ref: '#selfLabel' },
            maxLength: 10,
          },
        },
      },
      selfLabel: {
        type: 'object',
        description: 'Metadata tag on an atproto record, published by the author within the record.',
        required: ['val'],
        properties: {
          val: { type: 'string', maxLength: 128 },
        },
      },
    },
  },
];

async function listJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory.pathname, entry.name);
      if (entry.isDirectory()) {
        return listJsonFiles(new URL(`${entry.name}/`, directory));
      }
      return entry.isFile() && entry.name.endsWith('.json') ? [path] : [];
    }),
  );

  return files.flat().sort();
}

const docs = [];
for (const file of await listJsonFiles(lexiconRoot)) {
  const json = JSON.parse(await readFile(file, 'utf8'));
  docs.push(parseLexiconDoc(json));
}

const lexicons = new Lexicons();
for (const doc of externalLexicons) {
  lexicons.add(parseLexiconDoc(doc));
}
for (const doc of docs) {
  lexicons.add(doc);
}

for (const doc of docs) {
  for (const defName of Object.keys(doc.defs)) {
    lexicons.getDefOrThrow(defName === 'main' ? doc.id : `${doc.id}#${defName}`);
  }
}

const sampleListing = {
  $type: 'pet.lost.listing',
  kind: 'pet.lost.defs#missingPet',
  status: 'pet.lost.defs#statusOpen',
  pet: {
    name: 'Miso',
    species: 'cat',
    colors: [{ name: 'orange' }],
    description: 'Orange tabby with a white chin and blue collar.',
  },
  summary: 'Missing orange tabby near Dolores Park',
  description: 'Indoor cat, shy around strangers. Please do not chase.',
  location: {
    name: 'Dolores Park, San Francisco, CA',
    latitudeE7: 377594000,
    longitudeE7: -1224269000,
    accuracyMeters: 800,
  },
  observedAt: '2026-07-15T12:00:00.000Z',
  labels: {
    $type: 'com.atproto.label.defs#selfLabels',
    values: [{ val: '!warn' }],
  },
  langs: ['en'],
  createdAt: '2026-07-15T13:00:00.000Z',
};

lexicons.assertValidRecord('pet.lost.listing', sampleListing);

console.log(`Validated ${docs.length} local lexicon document${docs.length === 1 ? '' : 's'}.`);
