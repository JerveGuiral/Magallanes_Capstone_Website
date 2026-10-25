import { LGU_CONTACT } from './site';

/**
 * Single source of truth for the privacy notice.
 *
 * Rendered in two places — the full /privacy page and the consent modal on the
 * contact form. Keeping one copy matters more here than for ordinary content:
 * a consent notice that disagrees with the published policy is a compliance
 * problem under the Data Privacy Act, not just a copy inconsistency.
 */

export type PolicySection = { title: string; body: string };

export const PRIVACY_SUMMARY =
  'How the Municipality of Magallanes collects, uses, and protects personal data submitted through this website, in compliance with the Data Privacy Act of 2012 (RA 10173).';

export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    title: 'What we collect',
    body: 'We collect only the personal data you provide directly: your name, barangay, contact number or email, and the details of a request or concern when you use the Contact form, apply for a service, or message our chatbot. We do not collect data from third-party brokers or track you across other websites.',
  },
  {
    title: 'Why we collect it',
    body: 'Personal data submitted through this site is processed solely to act on your request — routing a concern to the right office, following up on a service application, or responding to an inquiry. We do not use it for marketing, and we do not sell or rent it to any third party.',
  },
  {
    title: 'Legal basis',
    body: 'Processing is carried out under the mandate of the Local Government Code of 1991 and in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.',
  },
  {
    title: 'Who can access it',
    body: 'Only authorized personnel of the office your request concerns can view your submission. Chat transcripts are reviewed only to improve the assistant’s answers and are never published with your identity attached.',
  },
  {
    title: 'Retention',
    body: 'Records are retained only as long as necessary to act on your request and to comply with the National Archives of the Philippines’ records retention schedule for local government units, after which they are securely disposed of.',
  },
  {
    title: 'Your rights',
    body: 'Under the Data Privacy Act, you have the right to be informed, to access your data, to correct inaccurate data, to object to processing, to data portability, and to file a complaint with the National Privacy Commission. To exercise any of these rights, contact our Data Protection Officer below.',
  },
];

// No Data Protection Officer contact has been published; requests go through the Mayor's Office.
export const DATA_PROTECTION_OFFICER: { label: string; value: string; mono?: boolean }[] = [
  { label: 'Office', value: 'Office of the Mayor' },
  { label: 'Email', value: LGU_CONTACT.email, mono: true },
  { label: 'Phone', value: LGU_CONTACT.phone, mono: true },
];

export const NPC_NOTE =
  'You may also file a complaint directly with the National Privacy Commission at privacy.gov.ph.';
