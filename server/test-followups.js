// Offline checks for conversation memory (languageDetect.js): a short follow-up keeps the topic of
// the previous answer, but a question that names a topic of its own is a new question.
// Run: node server/test-followups.js
import assert from 'node:assert/strict';
import { refineIntent } from './services/languageDetect.js';

// [previous answer, question, what the agent matched, its confidence, expected answer]
const NEW_QUESTIONS = [
  ['tourism.centennial-tree.inquire', 'what is the office hours in magallanes?', 'office.hours.inquire', 0.76, 'office.hours.inquire'],
  ['tourism.magellan-shrine.inquire', 'Where is the BPLO office?', 'permit.business.location.inquire', 1, 'permit.business.location.inquire'],
  ['places.market.inquire', 'Where can I get a laboratory test?', 'health.labtest.inquire', 1, 'health.labtest.inquire'],
  ['tourism.baywalk.inquire', 'Where are the evacuation centers?', 'disaster.hazard.inquire', 1, 'disaster.hazard.inquire'],
  ['tourism.accommodation.inquire', 'Where is the nearest hospital?', 'places.hospital.inquire', 1, 'places.hospital.inquire'],
  ['permit.building.requirements.inquire', 'How much is the marriage license fee?', 'civil.registry.marriage.fee.inquire', 1, 'civil.registry.marriage.fee.inquire'],
  ['permit.building.requirements.inquire', 'How much is the police clearance?', 'clearance.police.inquire', 1, 'clearance.police.inquire'],
  ['health.yakap.inquire', 'Kinsa ang MSWDO?', 'officials.head.mswdo.inquire', 1, 'officials.head.mswdo.inquire'],
  ['health.yakap.inquire', 'Who are the former mayors of Magallanes?', 'officials.former.mayors.inquire', 1, 'officials.former.mayors.inquire'],
  ['civil.registry.birth.new.inquire', 'Unsa ang requirements sa pagpakasal?', 'civil.registry.marriage.license.inquire', 1, 'civil.registry.marriage.license.inquire'],
];

const FOLLOW_UPS = [
  ['tourism.magellan-shrine.inquire', 'what time is it open?', 'office.hours.inquire', 0.9, 'tourism.magellan-shrine.inquire'],
  ['tourism.magellan-shrine.inquire', 'is it open on sunday?', 'Default Fallback Intent', 1, 'tourism.magellan-shrine.inquire'],
  ['tourism.centennial-tree.inquire', 'how much is the entrance?', 'Default Fallback Intent', 1, 'tourism.centennial-tree.inquire'],
  ['ctc.cedula.inquire', 'pila?', 'Default Fallback Intent', 1, 'ctc.cedula.inquire'],
  ['clearance.barangay.inquire', 'pila?', 'Default Fallback Intent', 1, 'clearance.barangay.fee.inquire'],
  ['permit.building.requirements.inquire', 'how much will the permit cost?', 'Default Fallback Intent', 1, 'permit.building.fee.inquire'],
  ['civil.registry.birth.new.inquire', 'what if it is late?', 'Default Fallback Intent', 1, 'civil.registry.birth.late.inquire'],
  ['office.hours.inquire', 'where is it?', 'Default Fallback Intent', 1, 'office.location.inquire'],
];

let passed = 0;
for (const [label, cases] of [['new question', NEW_QUESTIONS], ['follow-up', FOLLOW_UPS]]) {
  for (const [last, q, df, conf, want] of cases) {
    const got = refineIntent(q, df, [], { confidence: conf, lastIntent: last });
    assert.equal(got, want, `${label} after ${last}: "${q}" -> ${got}, expected ${want}`);
    passed++;
  }
  console.log(`  ok  ${cases.length} ${label}s`);
}
console.log(`\n${passed} checks passed.`);
