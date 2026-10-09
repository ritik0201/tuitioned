export interface TimezoneOption {
  value: string;
  label: string;
  shortCode: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: "Asia/Kolkata", label: "IST - India Standard Time (Asia/Kolkata)", shortCode: "IST" },
  { value: "UTC", label: "UTC - Coordinated Universal Time", shortCode: "UTC" },
  { value: "America/New_York", label: "EST / EDT - Eastern Time (New York)", shortCode: "EST/EDT" },
  { value: "America/Chicago", label: "CST / CDT - Central Time (Chicago)", shortCode: "CST/CDT" },
  { value: "America/Denver", label: "MST / MDT - Mountain Time (Denver)", shortCode: "MST/MDT" },
  { value: "America/Los_Angeles", label: "PST / PDT - Pacific Time (Los Angeles)", shortCode: "PST/PDT" },
  { value: "Europe/London", label: "GMT / BST - UK Time (London)", shortCode: "GMT/BST" },
  { value: "Europe/Paris", label: "CET / CEST - Central European Time (Paris)", shortCode: "CET/CEST" },
  { value: "Asia/Dubai", label: "GST - Gulf Standard Time (Dubai)", shortCode: "GST" },
  { value: "Asia/Singapore", label: "SGT - Singapore Time", shortCode: "SGT" },
  { value: "Asia/Tokyo", label: "JST - Japan Standard Time (Tokyo)", shortCode: "JST" },
  { value: "Australia/Sydney", label: "AEST / AEDT - Australian Eastern (Sydney)", shortCode: "AEST/AEDT" },
  { value: "Pacific/Auckland", label: "NZST / NZDT - New Zealand Time", shortCode: "NZST/NZDT" }
];

/**
 * Returns a clean short display name for a timezone (e.g. "IST" instead of "Asia/Kolkata")
 */
export function getTimezoneDisplay(tz?: string, includeCity = false): string {
  if (!tz) return "IST";

  const cleanTz = tz.trim();

  // If already a short code
  if (["IST", "UTC", "EST", "EDT", "PST", "PDT", "CST", "CDT", "GMT", "BST", "GST", "SGT", "JST"].includes(cleanTz.toUpperCase())) {
    return cleanTz.toUpperCase();
  }

  // Exact match from common options
  const match = COMMON_TIMEZONES.find((item) => item.value === cleanTz);
  if (match) {
    return includeCity ? `${match.shortCode} (${match.value})` : match.shortCode;
  }

  // Known city fallbacks
  if (cleanTz.includes("Kolkata") || cleanTz.includes("Calcutta") || cleanTz.includes("India")) {
    return "IST";
  }

  // Try to derive short name via Intl format
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: cleanTz,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === "timeZoneName")?.value;
    if (tzPart && !tzPart.includes("/") && !tzPart.includes("GMT+") && !tzPart.includes("GMT-")) {
      return tzPart;
    }
  } catch (e) {
    // Ignore invalid IANA string fallback
  }

  // Fallback: replace slashes and underscores (e.g. "Asia/Kolkata" -> "Asia - Kolkata")
  return includeCity ? cleanTz : cleanTz.split("/").pop()?.replace(/_/g, " ") || cleanTz;
}

/**
 * Returns full dropdown options for admin timezone selector
 */
export function getTimezoneSelectOptions() {
  let allSupported: string[] = [];
  try {
    // @ts-ignore
    allSupported = Intl.supportedValuesOf("timeZone");
  } catch (e) {
    allSupported = COMMON_TIMEZONES.map((t) => t.value);
  }

  // Place COMMON_TIMEZONES first, then append other IANA timezones
  const optionsMap = new Map<string, { value: string; label: string }>();

  COMMON_TIMEZONES.forEach((tz) => {
    optionsMap.set(tz.value, { value: tz.value, label: tz.label });
  });

  allSupported.forEach((tz) => {
    if (!optionsMap.has(tz)) {
      const displayCode = getTimezoneDisplay(tz);
      optionsMap.set(tz, { value: tz, label: `${displayCode} (${tz})` });
    }
  });

  return Array.from(optionsMap.values());
}
