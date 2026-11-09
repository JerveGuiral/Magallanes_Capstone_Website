// Offline checks for the passenger boat answers (services/boat.js): each question gets the
// specific answer it asks for — the panel's requirement — in the direction it asks about.
// Run: node server/test-boat.js
import assert from 'node:assert/strict';
import { boatDirection, boatIntentFor, boatReply, parseTime, BOAT_SCHEDULE } from './services/boat.js';
import { refineIntent } from './services/languageDetect.js';

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};
const I = (a) => `transport.boat.${a}.inquire`;
// 2026-11-09 at the given Philippine time (UTC+8).
const at = (hhmm) => new Date(`2026-11-09T${hhmm}:00+08:00`);

check('each question goes to the specific answer it asks for', () => {
  const cases = [
    ['unsa oras ang last trip sa baroto paingon Butuan?', I('last-trip')],
    ['What time is the first boat to Butuan?', I('first-trip')],
    ['pila pamasahe sa baroto?', I('fare')],
    ['Do students get a discount on the boat?', I('fare')],
    ['naa pa bay baroto karong alas 5?', I('next-trip')],
    ['next boat to Butuan', I('next-trip')],
    ['pila ka byahe sa baroto kada adlaw?', I('trips-per-day')],
    ['is there a boat on Sunday?', I('days')],
    ['how long is the boat ride?', I('duration')],
    ['asa sakay sa baroto?', I('terminal')],
    ['boat schedule', I('schedule')],
    ['unsa ang schedule sa baroto karon?', I('schedule')],
    ['Unsa oras mobiya ang baroto gikan Butuan?', I('schedule')],
  ];
  for (const [q, want] of cases) assert.equal(boatIntentFor(q), want, q);
});

check('direction: the town the boats leave from', () => {
  assert.equal(boatDirection('last trip paingon Butuan'), 'magallanes');
  assert.equal(boatDirection('first boat from Butuan'), 'butuan');
  assert.equal(boatDirection('pauli na ko, unsa oras ang last trip?'), 'butuan');
  assert.equal(boatDirection('last trip?'), null);
  assert.equal(boatDirection('from Butuan to Magallanes'), 'butuan');
});

check('times named in a question', () => {
  assert.equal(parseTime('naa pa bay baroto karong alas 5?'), 17 * 60);
  assert.equal(parseTime('alas 9 sa buntag'), 9 * 60);
  assert.equal(parseTime('boat at 3:30?'), 15 * 60 + 30);
  assert.equal(parseTime('12 noon boat'), 12 * 60);
  assert.equal(parseTime('children 3 to 11 years'), null);
});

check('the last trip answer is just the last trip, for the direction asked', () => {
  const one = boatReply(I('last-trip'), 'last trip paingon Butuan?', 'english');
  assert.match(one, /4:30 PM/);
  assert.doesNotMatch(one, /5:30 PM|6:20 AM|half fare/);
  const both = boatReply(I('last-trip'), 'last trip?', 'english');
  assert.match(both, /4:30 PM/);
  assert.match(both, /5:30 PM/);
  assert.doesNotMatch(both, /7:10 AM|half fare/);
});

check('next trip: from a named time, and from the time now', () => {
  const five = boatReply(I('next-trip'), 'naa pa bay baroto karong alas 5?', 'bisaya');
  assert.match(five, /Gikan Magallanes paingon Butuan: wala na — ang last trip 4:30 PM/);
  assert.match(five, /Gikan Butuan paingon Magallanes: 5:30 PM \(last trip\)/);
  const afternoon = boatReply(I('next-trip'), 'next boat?', 'english', at('15:10'));
  assert.match(afternoon, /It's 3:10 PM now/);
  assert.match(afternoon, /From Magallanes to Butuan: 3:30 PM/);
  assert.match(afternoon, /From Butuan to Magallanes: 4:00 PM/);
  const exact = boatReply(I('next-trip'), 'next boat to Butuan?', 'english', at('08:10'));
  assert.match(exact, /From Magallanes to Butuan: 8:10 AM/);
  assert.doesNotMatch(exact, /From Butuan/);
  const night = boatReply(I('next-trip'), 'next boat?', 'english', at('20:00'));
  assert.match(night, /none — the last trip leaves at 4:30 PM/);
  assert.match(night, /Tomorrow's first trips: 6:20 AM from Magallanes, 7:10 AM from Butuan/);
});

check('fare, trip length, trips a day and days answer only that', () => {
  const fare = boatReply(I('fare'), 'pila?', 'bisaya');
  assert.match(fare, /half fare/);
  assert.doesNotMatch(fare, /AM|PM/);
  assert.equal(boatReply(I('duration'), 'how long?', 'english'), `The boat ride between Magallanes and Butuan City takes about ${BOAT_SCHEDULE.tripMinutes} minutes.`);
  assert.match(boatReply(I('trips-per-day'), '', 'english'), /10 trips a day, 6:20 AM to 4:30 PM[\s\S]*12 trips a day, 7:10 AM to 5:30 PM/);
  assert.match(boatReply(I('days'), '', 'english'), /doesn't mention Sundays or holidays/);
});

check('one direction of the schedule: just those departures', () => {
  const r = boatReply(I('schedule'), 'Unsa oras mobiya ang baroto gikan Butuan?', 'bisaya');
  assert.match(r, /^Mga oras sa baroto gikan Butuan paingon Magallanes/);
  assert.match(r, /7:10 AM/);
  assert.doesNotMatch(r, /6:20 AM|Pamasahe/);
});

check('the whole schedule when that is what was asked', () => {
  const r = boatReply(I('schedule'), 'boat schedule', 'english');
  assert.match(r, /From Magallanes to Butuan:\n6:20 AM/);
  assert.match(r, /From Butuan to Magallanes:\n7:10 AM/);
});

// --- In a conversation (languageDetect.js) ---
const turn = (q, last, df = 'Default Fallback Intent', conf = 1) => refineIntent(q, df, [], { confidence: conf, lastIntent: last });

check('follow-ups get the specific answer too', () => {
  assert.equal(turn('pila?', I('schedule')), I('fare'));
  assert.equal(turn('unsa oras ang last trip?', I('schedule')), I('last-trip'));
  assert.equal(turn('how long is the ride?', I('schedule')), I('duration'));
  assert.equal(turn('kadugay sa byahe?', I('fare')), I('duration'));
  assert.equal(turn('asa sakay?', I('schedule')), I('terminal'));
  assert.equal(turn('naa ba sa Sunday?', I('schedule')), I('days'));
  assert.equal(turn('pila ang senior?', I('schedule')), I('fare'));
});

check('"how about from Butuan?" keeps the question and switches the direction', () => {
  assert.equal(turn('how about from Butuan?', I('last-trip'), 'tourism.getting-there.inquire', 0.8), I('last-trip'));
  const r = boatReply(I('last-trip'), 'how about from Butuan?', 'english');
  assert.match(r, /from Butuan to Magallanes: 5:30 PM/);
  assert.doesNotMatch(r, /4:30 PM/);
});

check('a new topic after a boat answer is a new question', () => {
  assert.equal(turn('asa dapit ang magallanes?', I('last-trip'), 'about.facts.inquire'), 'about.facts.inquire');
  assert.equal(turn('Where is the public market?', I('fare'), 'places.market.inquire'), 'places.market.inquire');
  assert.equal(turn('unsa ang requirements sa business permit?', I('schedule'), 'permit.business.new.inquire'), 'permit.business.new.inquire');
});

console.log(`\nBoat: ${passed} checks passed.`);
