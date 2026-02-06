"use client";

import type React from "react";

export type NavIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

function BaseIcon({
  size = 20,
  children,
  ...props
}: NavIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconAbout(props: NavIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M20 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    </BaseIcon>
  );
}

export function IconEducation(props: NavIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" />
    </BaseIcon>
  );
}

export function IconProjects(props: NavIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </BaseIcon>
  );
}

export function IconCourses(props: NavIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 19a2 2 0 0 0 2 2h12" />
      <path d="M6 3h12v16H6a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2Z" />
    </BaseIcon>
  );
}

export function IconCertificates(props: NavIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 4h10v10H7V4Z" />
      <path d="M9 14v6l3-2 3 2v-6" />
    </BaseIcon>
  );
}

export function IconContact(props: NavIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 4h16v16H4V4Z" />
      <path d="m4 6 8 7 8-7" />
    </BaseIcon>
  );
}

export function IconReferences(props: NavIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <path d="M9 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M17 8h5" />
      <path d="M17 12h5" />
      <path d="M17 16h5" />
    </BaseIcon>
  );
}

export function IconExperience(props: NavIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 19V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M16 7V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2" />
    </BaseIcon>
  );
}




