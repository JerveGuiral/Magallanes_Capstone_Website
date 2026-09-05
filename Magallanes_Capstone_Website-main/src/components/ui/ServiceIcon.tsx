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
import type { Service } from '../../data/site';

const MAP: Record<Service['icon'], React.ComponentType<{className?: string;}>> = {
  permit: FileTextIcon,
  clearance: StampIcon,
  civil: BookUserIcon,
  tax: LandmarkIcon,
  health: HeartPulseIcon,
  concern: MegaphoneIcon,
  assistance: HandHelpingIcon,
  bidding: GavelIcon
};

type ServiceIconProps = {
  name: Service['icon'];
  className?: string;
};

export function ServiceIcon({ name, className = 'h-6 w-6' }: ServiceIconProps) {
  const Icon = MAP[name] || FileTextIcon;
  return <Icon className={className} aria-hidden="true" />;
}