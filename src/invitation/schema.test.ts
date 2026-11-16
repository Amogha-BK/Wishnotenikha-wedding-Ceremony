import assert from "node:assert/strict";
import test from "node:test";
import {
  ConfigurationError,
  dateParts,
  eventKinds,
  isIndiaDateTime,
  moveWeddingDate,
  toTemplateConfig,
  validateRecord,
} from "./schema.ts";
import { createSampleRecord, sampleEvent } from "./sampleRecord.ts";

test("sample data survives a JSON round trip and derives coherent invitation dates", () => {
  const config = toTemplateConfig(validateRecord(JSON.parse(JSON.stringify(createSampleRecord()))));
  assert.equal(config.display.wedding.full, "14 February 2027");
  assert.equal(config.display.wedding.weekday, "Sunday");
  assert.equal(config.display.countdownLabel, "14 February 2027 · 12:00 a.m. IST");
  assert.equal(config.celebrations[0].dateLabel, "Saturday, 13 February 2027");
  assert.equal(config.celebrations[0].timeLabel, "7:00 p.m.");
  assert.equal(new Date(config.celebrations[0].start).toISOString(), "2027-02-13T13:30:00.000Z");
  assert.equal(config.display.celebrationsLabel, "13 & 14 February 2027 · Jaipur");
});
test("all five supported functions render through the same data adapter", () => {
  const sample = createSampleRecord();
  sample.celebrations = eventKinds.map((id) => sampleEvent(id, sample.weddingDate));
  const config = toTemplateConfig(validateRecord(sample));
  assert.deepEqual(
    config.celebrations.map((e) => e.id),
    eventKinds,
  );
  assert.ok(config.celebrations.every((e) => e.calendarTitle.includes("Aanya & Vivaan")));
});
test("optional fields can be omitted without leaking previous customer defaults", () => {
  const sample = createSampleRecord() as unknown as Record<string, unknown>;
  delete sample.optional;
  delete sample.wording;
  delete sample.contacts;
  delete sample.memorialLine;
  delete sample.scratchLocation;
  const config = toTemplateConfig(validateRecord(sample));
  assert.deepEqual(config.contacts, []);
  assert.equal(config.optional.musicUrl, "");
  assert.equal(config.wording.heroMessage, "");
  assert.equal(config.memorialLine, "");
});
test("date validation catches invalid months, non-leap days and invalid clocks", () => {
  for (const start of [
    "2027-02-29T10:00:00+05:30",
    "2027-13-01T10:00:00+05:30",
    "2027-02-14T24:00:00+05:30",
    "2027-02-14T10:00:00Z",
  ])
    assert.equal(isIndiaDateTime(start), false);
  assert.equal(isIndiaDateTime("2028-02-29T00:00:00+05:30"), true);
  assert.equal(dateParts("2027-01-01T00:00:00+05:30").full, "1 January 2027");
});
test("changing the wedding date requires the wedding function to agree", () => {
  const sample = createSampleRecord();
  sample.weddingDate = "2027-02-15";
  assert.throws(
    () => validateRecord(sample),
    (e: unknown) =>
      e instanceof ConfigurationError && e.issues.some((i) => i.path.endsWith(".start")),
  );
});
test("moving an order preserves function day offsets and IST times across a leap day", () => {
  const moved = moveWeddingDate(createSampleRecord(), "2028-02-29");
  assert.equal(moved.celebrations[0].start, "2028-02-28T19:00:00+05:30");
  assert.equal(moved.celebrations[2].start, "2028-02-29T19:00:00+05:30");
  assert.equal(moved.countdownTarget, "2028-02-29T00:00:00+05:30");
  assert.equal(toTemplateConfig(validateRecord(moved)).display.wedding.weekday, "Tuesday");
});
test("changing the wedding date while a function time is incomplete does not crash the editor", () => {
  const sample = createSampleRecord();
  sample.celebrations[0].start = ":00+05:30";
  const moved = moveWeddingDate(sample, "2028-02-29");
  assert.equal(moved.weddingDate, "2028-02-29");
  assert.equal(moved.celebrations[0].start, ":00+05:30");
  assert.throws(() => validateRecord(moved), ConfigurationError);
});
test("missing, duplicate and unknown functions are rejected", () => {
  for (const celebrations of [
    [],
    [sampleEvent("haldi", "2027-02-14")],
    [sampleEvent("wedding", "2027-02-14"), sampleEvent("wedding", "2027-02-14")],
    [{ ...sampleEvent("wedding", "2027-02-14"), id: "unknown" }],
  ])
    assert.throws(
      () => validateRecord({ ...createSampleRecord(), celebrations }),
      ConfigurationError,
    );
});
test("untrusted media and executable URL schemes are rejected", () => {
  for (const url of [
    "https://tracker.invalid/photo.jpg",
    "//tracker.invalid/x",
    "/assets/../../private.png",
    "data:image/svg+xml;base64,AAAA",
    "javascript:alert(1)",
  ]) {
    const sample = createSampleRecord();
    sample.media.portraitUrl = url;
    assert.throws(() => validateRecord(sample), ConfigurationError);
  }
  for (const mapUrl of [
    "javascript:alert(1)",
    "https://google.com.evil.invalid/maps",
    "https://www.google.com/search?q=private",
    "https://user:pass@www.google.com/maps",
  ]) {
    const sample = createSampleRecord();
    sample.venue.mapUrl = mapUrl;
    assert.throws(() => validateRecord(sample), ConfigurationError);
  }
});
test("blank Maps links are generated safely from each venue", () => {
  const sample = createSampleRecord();
  sample.venue.address = "Garden & Lake #1";
  const config = validateRecord(sample);
  assert.equal(
    new URL(config.venue.mapUrl).searchParams.get("query"),
    "Sample Garden Venue, Garden & Lake #1",
  );
  assert.equal(new URL(config.celebrations[0].mapUrl).hostname, "www.google.com");
});
test("unsupported languages, schemas and templates do not silently fall back", () => {
  for (const change of [{ language: "hi" }, { templateId: "unknown" }, { version: 2 }])
    assert.throws(() => validateRecord({ ...createSampleRecord(), ...change }), ConfigurationError);
});
test("malformed imports yield validation issues instead of crashing", () => {
  for (const input of [
    null,
    [],
    "hello",
    {},
    { ...createSampleRecord(), couple: null },
    { ...createSampleRecord(), weddingDate: "not-a-date" },
  ])
    assert.throws(() => validateRecord(input), ConfigurationError);
});
test("validated records strip unexpected fields and normalize blank contact lines", () => {
  const input = { ...createSampleRecord(), contacts: [""], privateDebugNotes: "should not ship" };
  const record = validateRecord(input);
  assert.deepEqual(record.contacts, []);
  assert.equal("privateDebugNotes" in record, false);
});
