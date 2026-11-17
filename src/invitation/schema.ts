/** Versioned customer data. No React, storage, or provider dependencies. */
export const eventKinds = ["nikah", "reception", "wedding", "mehndi", "haldi", "sangeet"] as const;
export type EventKind = (typeof eventKinds)[number];
export type WeddingEvent = {
  id: EventKind;
  shortName: string;
  title: string;
  start: string;
  timeLabel?: string;
  venue?: string;
  address?: string;
  mapUrl?: string;
  supportingLine: string;
  image: string;
  scene: "lanterns" | "fire" | "candlelight";
  phereTime?: string;
};
export type WeddingRecord = {
  version: 1;
  templateId: "botanical";
  language: "en";
  weddingDate: string;
  countdownTarget: string;
  city: string;
  scratchLocation: string;
  couple: {
    first: string;
    second: string;
    groomFullName?: string;
    brideFullName?: string;
    brideQualification?: string;
    groomQualification?: string;
    brideParents: string;
    brideGrandparents?: string;
    groomParents: string;
    groomGrandparents: string;
  };
  islamicInvocation?: string;
  memorialLine: string;
  invitationLine: string;
  blessingLine: string;
  closingBlessing?: string;
  homeAddress: string;
  hosts: string;
  rsvp: string;
  wishesFrom: string;
  venue: { name?: string; address?: string; mapUrl?: string };
  contacts: string[];
  optional: {
    travel: string;
    stay: string;
    contact: string;
    musicUrl: string;
    whatsappHostNumber: string;
  };
  media: { portraitUrl: string; portraitAlt: string; venueArtworkUrl: string };
  wording: {
    heroMessage: string;
    heroFootnote: string;
    celebrationsIntro: string;
    closingNote: string;
  };
  celebrations: WeddingEvent[];
};
export type ValidationIssue = { path: string; message: string };
export class ConfigurationError extends Error {
  issues: ValidationIssue[];
  constructor(issues: ValidationIssue[]) {
    super(issues.map(({ path, message }) => `${path}: ${message}`).join("\n"));
    this.issues = issues;
    this.name = "ConfigurationError";
  }
}
export const MAX_RECORD_BYTES = 24 * 1024 * 1024;
export const mapSearch = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
export const timezone = "Asia/Kolkata";
const validDay = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number(value.slice(0, 4)) >= 2000 &&
    Number(value.slice(0, 4)) <= 2100 &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};
export function isIndiaDateTime(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\+05:30$/.test(value) &&
    validDay(value.slice(0, 10))
  );
}

/** Preserve the functions' day offsets when starting an order on a different date. */
export function moveWeddingDate(record: WeddingRecord, weddingDate: string): WeddingRecord {
  if (!validDay(weddingDate) || !validDay(record.weddingDate)) return { ...record, weddingDate };
  const difference =
    Date.parse(`${weddingDate}T00:00:00Z`) - Date.parse(`${record.weddingDate}T00:00:00Z`);
  const shift = (value: string) =>
    isIndiaDateTime(value)
      ? new Date(Date.parse(`${value.slice(0, 10)}T00:00:00Z`) + difference)
          .toISOString()
          .slice(0, 10) + value.slice(10)
      : value;
  return {
    ...record,
    weddingDate,
    countdownTarget: shift(record.countdownTarget),
    celebrations: record.celebrations.map((event) => ({ ...event, start: shift(event.start) })),
  };
}

/** Reconstruct allowed fields rather than trusting imported JSON or spreading it into UI. */
export function validateRecord(value: unknown): WeddingRecord {
  const issues: ValidationIssue[] = [];
  const object = (v: unknown, path: string): Record<string, unknown> => {
    if (!v || typeof v !== "object" || Array.isArray(v)) {
      issues.push({ path, message: "Must be an object." });
      return {};
    }
    return v as Record<string, unknown>;
  };
  const text = (
    o: Record<string, unknown>,
    key: string,
    path: string,
    required = false,
    max = 2000,
  ) => {
    const raw = o[key];
    if (raw === undefined && !required) return "";
    if (typeof raw !== "string") {
      issues.push({ path: `${path}${key}`, message: "Must be text." });
      return "";
    }
    const v = raw.trim();
    if ((required && !v) || v.length > max)
      issues.push({
        path: `${path}${key}`,
        message: required && !v ? "Required." : `Use at most ${max} characters.`,
      });
    return v;
  };
  const media = (v: string, path: string, kind: "image" | "audio", required = false) => {
    if (!v && !required) return v;
    const dataPattern =
      kind === "image"
        ? /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/
        : /^data:audio\/(?:mpeg|mp3|mp4|wav|x-wav|ogg);base64,[A-Za-z0-9+/]+={0,2}$/;
    // Local assets and embedded uploads avoid contacting an external host during draft preview.
    if (!/^\/(?:assets\/[A-Za-z0-9_./-]+|envelope-poster\.jpg)$/.test(v) && !dataPattern.test(v))
      issues.push({
        path,
        message: `Choose a local ${kind} file or an /assets/ path. External media is not loaded.`,
      });
    if (v.includes("..") || v.length > 12 * 1024 * 1024)
      issues.push({ path, message: "Invalid path or media exceeds 8 MB." });
    return v;
  };
  const map = (v: string, path: string, address: string) => {
    if (!v) return mapSearch(address);
    try {
      const u = new URL(v);
      if (
        u.protocol !== "https:" ||
        u.username ||
        u.password ||
        !["www.google.com", "google.com", "maps.google.com", "maps.app.goo.gl", "goo.gl"].includes(
          u.hostname,
        ) ||
        (u.hostname === "goo.gl" && !u.pathname.startsWith("/maps/")) ||
        (["www.google.com", "google.com"].includes(u.hostname) && !u.pathname.startsWith("/maps"))
      )
        throw new Error();
    } catch {
      issues.push({
        path,
        message: "Use an HTTPS Google Maps link, or leave blank to generate one.",
      });
    }
    return v;
  };
  const root = object(value, "record");
  if (root.version !== 1)
    issues.push({ path: "version", message: "Only data version 1 is supported." });
  if (root.templateId !== "botanical")
    issues.push({
      path: "templateId",
      message: "Only the existing botanical template is available.",
    });
  if (root.language !== "en")
    issues.push({ path: "language", message: "This template currently supports English only." });
  const couple = object(root.couple, "couple");
  const venue = object(root.venue, "venue");
  const optional = root.optional === undefined ? {} : object(root.optional, "optional");
  const images = object(root.media, "media");
  const wording = root.wording === undefined ? {} : object(root.wording, "wording");
  const date = text(root, "weddingDate", "", true);
  if (!validDay(date))
    issues.push({ path: "weddingDate", message: "Choose a real date between 2000 and 2100." });
  const countdown = text(root, "countdownTarget", "", true);
  if (!isIndiaDateTime(countdown))
    issues.push({ path: "countdownTarget", message: "Use an Indian date/time ending in +05:30." });
  const name = text(venue, "name", "venue.", true);
  const address = text(venue, "address", "venue.", true);
  const rawEvents = Array.isArray(root.celebrations) ? root.celebrations : [];
  if (rawEvents.length < 1 || rawEvents.length > 5)
    issues.push({ path: "celebrations", message: "Include 1–5 functions, including the wedding." });
  const seen = new Set<string>();
  const celebrations = rawEvents.slice(0, 5).map((raw, index): WeddingEvent => {
    const path = `celebrations.${index}.`;
    const e = object(raw, path);
    const id = text(e, "id", path, true);
    if (!eventKinds.includes(id as EventKind) || seen.has(id))
      issues.push({ path: `${path}id`, message: "Choose a unique function type." });
    seen.add(id);
    const start = text(e, "start", path, true);
    if (!isIndiaDateTime(start))
      issues.push({ path: `${path}start`, message: "Choose a real date and time in IST." });
    if ((id === "wedding" || id === "nikah") && start.slice(0, 10) !== date)
      issues.push({
        path: `${path}start`,
        message: "Wedding function date must match the wedding date.",
      });
    const ev = text(e, "venue", path, true);
    const ea = text(e, "address", path, true);
    const scene = text(e, "scene", path, true);
    if (!["lanterns", "fire", "candlelight"].includes(scene))
      issues.push({ path: `${path}scene`, message: "Unsupported decorative scene." });
    return {
      id: id as EventKind,
      start,
      timeLabel: typeof e.timeLabel === "string" ? text(e, "timeLabel", path, false, 120) : undefined,
      shortName: text(e, "shortName", path, true, 120),
      title: text(e, "title", path, true, 200),
      venue: ev,
      address: ea,
      mapUrl: map(text(e, "mapUrl", path), `${path}mapUrl`, `${ev}, ${ea}`),
      supportingLine: text(e, "supportingLine", path),
      image: media(text(e, "image", path, true, 12 * 1024 * 1024), `${path}image`, "image", true),
      scene: scene as WeddingEvent["scene"],
      phereTime: text(e, "phereTime", path),
    };
  });
  if (!seen.has("wedding") && !seen.has("nikah"))
    issues.push({ path: "celebrations", message: "A wedding function is required." });
  const contacts = Array.isArray(root.contacts)
    ? root.contacts.filter((v) => v !== "")
    : root.contacts === undefined
      ? []
      : root.contacts;
  if (
    !Array.isArray(contacts) ||
    contacts.length > 6 ||
    contacts.some((v) => typeof v !== "string" || !/^[+\d ()-]{7,25}$/.test(v))
  )
    issues.push({
      path: "contacts",
      message: "Use up to six phone numbers (7–25 digits/phone characters).",
    });
  const whatsapp = text(optional, "whatsappHostNumber", "optional.");
  if (whatsapp && !/^\+?\d{10,15}$/.test(whatsapp))
    issues.push({
      path: "optional.whatsappHostNumber",
      message: "Use 10–15 digits including country code.",
    });
  const record: WeddingRecord = {
    version: 1,
    templateId: "botanical",
    language: "en",
    weddingDate: date,
    countdownTarget: countdown,
    city: text(root, "city", "", true, 120),
    scratchLocation: text(root, "scratchLocation", "", false, 160),
    couple: {
      first: text(couple, "first", "couple.", true, 80),
      second: text(couple, "second", "couple.", true, 80),
      brideFullName: text(couple, "brideFullName", "couple.", false, 200),
      groomFullName: text(couple, "groomFullName", "couple.", false, 200),
      brideQualification: text(couple, "brideQualification", "couple.", false, 80),
      groomQualification: text(couple, "groomQualification", "couple.", false, 80),
      brideParents: text(couple, "brideParents", "couple."),
      brideGrandparents: text(couple, "brideGrandparents", "couple."),
      groomParents: text(couple, "groomParents", "couple."),
      groomGrandparents: text(couple, "groomGrandparents", "couple."),
    },
    memorialLine: text(root, "memorialLine", ""),
    invitationLine: text(root, "invitationLine", "", true),
    blessingLine: text(root, "blessingLine", ""),
    homeAddress: text(root, "homeAddress", ""),
    hosts: text(root, "hosts", ""),
    rsvp: text(root, "rsvp", ""),
    wishesFrom: text(root, "wishesFrom", ""),
    venue: {
      name,
      address,
      mapUrl: map(text(venue, "mapUrl", "venue."), "venue.mapUrl", `${name}, ${address}`),
    },
    contacts: Array.isArray(contacts)
      ? contacts.filter((v): v is string => typeof v === "string")
      : [],
    optional: {
      travel: text(optional, "travel", "optional."),
      stay: text(optional, "stay", "optional."),
      contact: text(optional, "contact", "optional."),
      musicUrl: media(
        text(optional, "musicUrl", "optional.", false, 12 * 1024 * 1024),
        "optional.musicUrl",
        "audio",
      ),
      whatsappHostNumber: whatsapp,
    },
    media: {
      portraitUrl: media(
        text(images, "portraitUrl", "media.", true, 12 * 1024 * 1024),
        "media.portraitUrl",
        "image",
        true,
      ),
      portraitAlt: text(images, "portraitAlt", "media.", true, 300),
      venueArtworkUrl: media(
        text(images, "venueArtworkUrl", "media.", true, 12 * 1024 * 1024),
        "media.venueArtworkUrl",
        "image",
        true,
      ),
    },
    wording: {
      heroMessage: text(wording, "heroMessage", "wording."),
      heroFootnote: text(wording, "heroFootnote", "wording."),
      celebrationsIntro: text(wording, "celebrationsIntro", "wording."),
      closingNote: text(wording, "closingNote", "wording."),
    },
    celebrations,
  };
  if (JSON.stringify(record).length > MAX_RECORD_BYTES)
    issues.push({ path: "record", message: "Keep the complete record below 24 MB." });
  if (issues.length) throw new ConfigurationError(issues);
  return record;
}

export function dateParts(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00+05:30` : value);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: timezone, ...options }).format(date);
  return {
    day: format({ day: "numeric" }),
    month: format({ month: "long" }),
    year: format({ year: "numeric" }),
    weekday: format({ weekday: "long" }),
    full: format({ day: "numeric", month: "long", year: "numeric" }),
    monthYear: format({ month: "long", year: "numeric" }),
  };
}
export function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(value))
    .replace(" AM", " a.m.")
    .replace(" PM", " p.m.");
}
export function toTemplateConfig(record: WeddingRecord) {
  const wedding = dateParts(record.weddingDate);
  const dates = [...new Set(record.celebrations.map((e) => e.start.slice(0, 10)))].sort();
  const first = dateParts(dates[0]);
  const last = dateParts(dates[dates.length - 1]);
  const range =
    dates.length === 1
      ? first.full
      : first.month === last.month && first.year === last.year
        ? `${dates.map((d) => dateParts(d).day).join(" & ")} ${last.month} ${last.year}`
        : dates.map((d) => dateParts(d).full).join(" · ");
  return {
    ...record,
    weddingLabel: record.city && record.city !== "India" ? `${wedding.full} · ${record.city}` : wedding.full,
    calendar: { timezone },
    display: {
      wedding,
      celebrationsLabel: record.city && record.city !== "India" ? `${range} · ${record.city}` : range,
      initials: [record.couple.first[0], record.couple.second[0]],
      countdownLabel: `${dateParts(record.countdownTarget).full}`,
    },
    celebrations: record.celebrations.map((e) => ({
      ...e,
      dateLabel: `${dateParts(e.start).weekday}, ${dateParts(e.start).full}`,
      hasExactTime: e.start.slice(11, 19) !== "00:00:00",
      timeLabel: e.timeLabel ?? (e.start.slice(11, 19) === "00:00:00" ? "" : timeLabel(e.start)),
      calendarTitle: `${record.couple.first} & ${record.couple.second} · ${e.shortName}`,
    })),
  };
}
export type TemplateConfig = ReturnType<typeof toTemplateConfig>;
export type Celebration = TemplateConfig["celebrations"][number];
