"use client";

const APP_TIME_ZONE = "Asia/Kolkata";

export function formatDateDMY(value) {
  if (!value) return "-";
  const raw = String(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatTime24(value, withSeconds = false) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
    hour12: false,
    hourCycle: "h23",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatDateTime24(value, withSeconds = false) {
  if (!value) return "-";
  return `${formatDateDMY(value)} ${formatTime24(value, withSeconds)}`;
}
