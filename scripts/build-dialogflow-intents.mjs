#!/usr/bin/env node
/**
 * Builds a Dialogflow ES agent ZIP containing the intents defined in code:
 *   - server/services/officials.js   (officials directory + follow-ups, with entities)
 *   - server/services/generalInfo.js (tourism & events, office information, small talk)
 *   - server/services/businessPermit.js (business permits + follow-ups)
 *   - server/services/civilRegistry.js (civil registry fees, corrections + follow-ups)
 *
 * Usage:  npm run dialogflow:build
 * Output: dialogflow/magallanes-intents.zip
 *
 * Import it in the Dialogflow console with Settings ⚙ → Export and Import → IMPORT FROM ZIP.
 * Never use RESTORE FROM ZIP: that replaces the whole agent and deletes every other intent.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { OFFICIALS_INTENTS, OFFICIALS_ENTITIES, FOLLOWUP_LIFESPAN } from '../server/services/officials.js';
import { GENERAL_INTENTS } from '../server/services/generalInfo.js';
import { BUSINESS_INTENTS } from '../server/services/businessPermit.js';
import { CIVIL_INTENTS } from '../server/services/civilRegistry.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'dialogflow');
const OUT_ZIP = path.join(OUT_DIR, 'magallanes-intents.zip');
const INTENTS = [...OFFICIALS_INTENTS, ...GENERAL_INTENTS, ...BUSINESS_INTENTS, ...CIVIL_INTENTS];
const MIN_PHRASES = 15;

// Stable ids, so re-importing an updated ZIP replaces the same intents instead of adding copies.
const uuid = (seed) => {
  const h = crypto.createHash('sha1').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const ENTITY_BY_NAME = Object.fromEntries(OFFICIALS_ENTITIES.map((e) => [e.name, e]));
const ENTITY_TOKEN = /\{@([\w-]+):([^}]+)\}/g;

/** Splits "How about {@barangay:Guiasan}?" into Dialogflow's annotated phrase parts. */
function phraseParts(phrase) {
  const parts = [];
  let last = 0;
  for (const m of phrase.matchAll(ENTITY_TOKEN)) {
    const [, entityName, text] = m;
    const entity = ENTITY_BY_NAME[entityName];
    if (!entity) throw new Error(`Unknown entity @${entityName} in "${phrase}"`);
    const known = entity.entries.some((e) => e.synonyms.some((s) => s.toLowerCase() === text.toLowerCase()));
    if (!known) throw new Error(`"${text}" is not a synonym of @${entityName} (in "${phrase}")`);
    if (m.index > last) parts.push({ text: phrase.slice(last, m.index), userDefined: false });
    parts.push({ text, alias: entity.param, meta: `@${entityName}`, userDefined: true });
    last = m.index + m[0].length;
  }
  if (last < phrase.length) parts.push({ text: phrase.slice(last), userDefined: false });
  return parts;
}

function intentParameters(phrases) {
  const used = new Set(phrases.flatMap((p) => [...p.matchAll(ENTITY_TOKEN)].map((m) => m[1])));
  return [...used].map((entityName) => {
    const { param } = ENTITY_BY_NAME[entityName];
    return {
      id: uuid(`param:${entityName}`),
      name: param,
      required: false,
      dataType: `@${entityName}`,
      value: `$${param}`,
      defaultValue: '',
      isList: false,
      prompts: [],
      promptMessages: [],
      noMatchPromptMessages: [],
      noInputPromptMessages: [],
      outputDialogContexts: [],
    };
  });
}

function intentFile({ name, english, phrases, inputContexts = [], outputContexts = [] }) {
  return {
    id: uuid(`intent:${name}`),
    name,
    auto: true,
    contexts: inputContexts,
    responses: [
      {
        resetContexts: false,
        action: '',
        affectedContexts: outputContexts.map((c) => ({ name: c, lifespan: FOLLOWUP_LIFESPAN, parameters: {} })),
        parameters: intentParameters(phrases),
        messages: [{ type: '0', title: '', textToSpeech: '', lang: 'en', speech: [english], condition: '' }],
        speech: [],
      },
    ],
    priority: 500000,
    webhookUsed: false,
    webhookForSlotFilling: false,
    fallbackIntent: false,
    events: [],
    conditionalResponses: [],
    condition: '',
    conditionalFollowupEvents: [],
  };
}

function userSaysFile({ name, phrases }) {
  return phrases.map((text) => ({
    id: uuid(`phrase:${name}:${text}`),
    data: phraseParts(text),
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  }));
}

// Dialogflow requires these two files in any agent ZIP. IMPORT keeps the existing agent's own
// settings; only intents and entities are taken from the archive.
const AGENT_JSON = {
  description: 'Magallanes LGU chatbot intents built from code',
  language: 'en',
  shortDescription: '',
  examples: '',
  linkToDocs: '',
  disableInteractionLogs: false,
  disableStackdriverLogs: true,
  defaultTimezone: 'Asia/Manila',
  isPrivate: true,
  mlMinConfidence: 0.3,
  supportedLanguages: [],
  enableOnePlatformApi: true,
  onePlatformApiVersion: 'v2',
  analyzeQueryTextSentiment: false,
  enabledKnowledgeBaseNames: [],
  knowledgeServiceConfidenceAdjustment: 0.0,
  dialogBuilderMode: false,
  baseActionPackagesUrl: '',
  enableSpellCorrection: false,
};

// --- Minimal ZIP writer (deflate), so the script needs no extra dependency ---

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function zip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name, 'utf8');
    const raw = Buffer.from(data, 'utf8');
    const packed = zlib.deflateRawSync(raw);
    const crc = crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);         // version needed
    local.writeUInt16LE(0x0800, 6);     // UTF-8 file names
    local.writeUInt16LE(8, 8);          // deflate
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, packed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);

    offset += local.length + nameBuf.length + packed.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuf, end]);
}

// --- Build ---

const names = INTENTS.map((i) => i.name);
const dupes = names.filter((n, i) => names.indexOf(n) !== i);
if (dupes.length) {
  console.error(`Duplicate intent names: ${[...new Set(dupes)].join(', ')}`);
  process.exit(1);
}

const short = INTENTS.filter((i) => i.phrases.length < MIN_PHRASES);
if (short.length) {
  console.error(`These intents have fewer than ${MIN_PHRASES} training phrases:`);
  for (const i of short) console.error(`  ${i.name} (${i.phrases.length})`);
  process.exit(1);
}

const json = (v) => JSON.stringify(v, null, 2);
const files = [
  { name: 'package.json', data: json({ version: '1.0.0' }) },
  { name: 'agent.json', data: json(AGENT_JSON) },
  ...OFFICIALS_ENTITIES.flatMap((entity) => [
    {
      name: `entities/${entity.name}.json`,
      data: json({
        id: uuid(`entity:${entity.name}`),
        name: entity.name,
        isOverridable: true,
        isEnum: false,
        isRegexp: false,
        automatedExpansion: false,
        allowFuzzyExtraction: true,
      }),
    },
    { name: `entities/${entity.name}_entries_en.json`, data: json(entity.entries) },
  ]),
  ...INTENTS.flatMap((intent) => [
    { name: `intents/${intent.name}.json`, data: json(intentFile(intent)) },
    { name: `intents/${intent.name}_usersays_en.json`, data: json(userSaysFile(intent)) },
  ]),
];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_ZIP, zip(files));

const total = INTENTS.reduce((n, i) => n + i.phrases.length, 0);
console.log(
  `Wrote ${path.relative(ROOT, OUT_ZIP)}: ${INTENTS.length} intents, ${total} training phrases, ` +
    `${OFFICIALS_ENTITIES.length} entities, follow-up context lifespan ${FOLLOWUP_LIFESPAN}.`
);
for (const i of INTENTS) console.log(`  ${String(i.phrases.length).padStart(3)}  ${i.name}`);
