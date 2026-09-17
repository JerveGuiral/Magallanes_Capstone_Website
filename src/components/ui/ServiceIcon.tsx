import React from 'react';
import {
  FileTextIcon,
  StampIcon,
  BookUserIcon,
  LandmarkIcon,
  HeartPulseIcon,
  MegaphoneIcon,
  HandHelpingIcon,
  GavelIcon } from
'lucide-react';

const KEYWORD_MAP: [RegExp, React.ComponentType<{ className?: string }>][] = [
  [/permit/i, FileTextIcon],
  [/clearance/i, StampIcon],
  [/civil|registry/i, BookUserIcon],
  [/tax|treasur/i, LandmarkIcon],
  [/health|sanit/i, HeartPulseIcon],
  [/concern|complaint|report/i, MegaphoneIcon],
  [/assist|welfare|social/i, HandHelpingIcon],
  [/bid|procure/i, GavelIcon],
];

type ServiceIconProps = {
  category?: string | null;
  className?: string;
};

export function ServiceIcon({ category, className = 'h-6 w-6' }: ServiceIconProps) {
  const match = category ? KEYWORD_MAP.find(([pattern]) => pattern.test(category)) : undefined;
  const Icon = match ? match[1] : FileTextIcon;
  return <Icon className={className} aria-hidden="true" />;
}
