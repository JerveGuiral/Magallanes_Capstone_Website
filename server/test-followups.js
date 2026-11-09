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
  // Passenger boat schedule (publicServices.js) — and the boat questions that are not about it.
  ['', 'unsa oras ang last trip sa baroto paingon butuan?', 'Default Fallback Intent', 1, 'transport.boat.last-trip.inquire'],
  ['', 'How much is the boat fare to Butuan?', 'tourism.getting-there.inquire', 0.8, 'transport.boat.fare.inquire'],
  ['', 'what time is the first pump boat?', 'Default Fallback Intent', 1, 'transport.boat.first-trip.inquire'],
  ['', 'pila ang bayad sa boat tour sa delta?', 'tourism.river-delta.inquire', 1, 'tourism.river-delta.inquire'],
  ['', 'unsaon pagparehistro sa akong baroto?', 'agri.fisherfolk.inquire', 1, 'agri.fisherfolk.inquire'],
  ['', 'How do I get to Magallanes from Butuan?', 'tourism.getting-there.inquire', 1, 'tourism.getting-there.inquire'],
  ['transport.boat.schedule.inquire', 'Where is the public market?', 'places.market.inquire', 1, 'places.market.inquire'],
  ['transport.boat.schedule.inquire', 'asa dapit ang magallanes?', 'about.facts.inquire', 1, 'about.facts.inquire'],
  ['transport.boat.schedule.inquire', 'where is Magallanes?', 'about.facts.inquire', 1, 'about.facts.inquire'],
  ['places.hospital.inquire', 'asa man dapit ang Magallanes?', 'about.facts.inquire', 1, 'about.facts.inquire'],
  ['transport.boat.schedule.inquire', 'how long does a business permit take?', 'permit.business.process.inquire', 1, 'permit.business.process.inquire'],
];

const FOLLOW_UPS = [
  ['transport.boat.schedule.inquire', 'pila?', 'Default Fallback Intent', 1, 'transport.boat.fare.inquire'],
  ['transport.boat.schedule.inquire', 'how about from Butuan?', 'tourism.getting-there.inquire', 0.8, 'transport.boat.schedule.inquire'],
  ['transport.boat.schedule.inquire', 'asa sakay sa magallanes?', 'Default Fallback Intent', 1, 'transport.boat.terminal.inquire'],
  ['transport.boat.schedule.inquire', 'asa?', 'Default Fallback Intent', 1, 'transport.boat.terminal.inquire'],
  ['transport.boat.schedule.inquire', 'kadugay sa byahe?', 'Default Fallback Intent', 1, 'transport.boat.duration.inquire'],
  ['transport.boat.schedule.inquire', 'how long is the ride?', 'Default Fallback Intent', 1, 'transport.boat.duration.inquire'],
  ['transport.boat.schedule.inquire', 'what time is the last trip?', 'Default Fallback Intent', 1, 'transport.boat.last-trip.inquire'],
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
