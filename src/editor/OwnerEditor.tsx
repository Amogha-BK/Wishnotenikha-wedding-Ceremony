import { useEffect, useId, useRef, useState } from "react";
import {
  ConfigurationError,
  MAX_RECORD_BYTES,
  eventKinds,
  moveWeddingDate,
  validateRecord,
  type EventKind,
  type ValidationIssue,
  type WeddingEvent,
  type WeddingRecord,
} from "../invitation/schema";
import { createSampleRecord, sampleEvent } from "../invitation/sampleRecord";
import { clearDraft, loadDraft, saveDraft } from "./storage";

const sections = [
  "Couple & date",
  "Family & wording",
  "Functions & venues",
  "Photos & artwork",
  "Music & extras",
  "Save & export",
] as const;
type Section = (typeof sections)[number];
type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  hint?: string;
  error?: string;
  required?: boolean;
};
function Field({ label, value, onChange, type = "text", hint, error, required }: FieldProps) {
  const id = useId();
  const props = {
    id,
    value,
    required,
    "aria-invalid": Boolean(error),
    "aria-describedby": `${id}-help`,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
  };
  return (
    <div className={`editor-field ${type === "textarea" ? "wide" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {type === "textarea" ? <textarea {...props} rows={3} /> : <input {...props} type={type} />}
      <small id={`${id}-help`} className={error ? "field-error" : "field-hint"}>
        {error || hint}
      </small>
    </div>
  );
}
function MediaField({
  label,
  value,
  onChange,
  kind = "image",
  report,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  kind?: "image" | "audio";
  report: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const id = useId();
  return (
    <div className="media-field wide">
      <Field
        label={`${label} asset path`}
        value={value.startsWith("data:") ? "" : value}
        onChange={onChange}
        hint={
          value.startsWith("data:")
            ? "A local upload is embedded. Choose another file or enter a path to replace it."
            : "Use an /assets/ path, or choose a file below. No external media requests."
        }
      />
      <label className="upload-label" htmlFor={id}>
        {busy ? "Reading file…" : `Choose ${kind} file`}
      </label>
      <input
        id={id}
        type="file"
        disabled={busy}
        accept={
          kind === "image"
            ? "image/png,image/jpeg,image/webp"
            : "audio/mpeg,audio/mp3,audio/mp4,audio/wav,audio/x-wav,audio/ogg"
        }
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          const allowed =
            kind === "image"
              ? ["image/png", "image/jpeg", "image/webp"]
              : ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/wav", "audio/x-wav", "audio/ogg"];
          if (!allowed.includes(file.type) || file.size > 8 * 1024 * 1024) {
            report("Choose a supported file no larger than 8 MB.");
            return;
          }
          setBusy(true);
          try {
            const data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(new Error("Could not read that file."));
              reader.readAsDataURL(file);
            });
            if (kind === "image") {
              const image = new Image();
              image.src = data;
              await image.decode();
            }
            onChange(data);
            report(`${label} added locally. Save or export to keep it.`);
          } catch {
            report("That file could not be decoded. Choose another file.");
          } finally {
            setBusy(false);
          }
        }}
      />
      {kind === "image" &&
        !value.includes("..") &&
        /^(?:\/assets\/[A-Za-z0-9_./-]+|data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2})$/.test(
          value,
        ) && (
          <img
            src={value}
            alt={`${label} selection`}
            className="media-thumbnail"
            referrerPolicy="no-referrer"
          />
        )}
      {value && (
        <button
          type="button"
          className="text-button"
          onClick={() => onChange(kind === "audio" ? "" : "/assets/wedding-floral-arch-v2.webp")}
        >
          {kind === "audio" ? "Remove music" : "Use shared floral artwork"}
        </button>
      )}
    </div>
  );
}

async function checkMedia(record: WeddingRecord) {
  const paths = [
    ...new Set(
      [
        record.media.portraitUrl,
        record.media.venueArtworkUrl,
        ...record.celebrations.map((e) => e.image),
        record.optional.musicUrl,
      ].filter((p) => p.startsWith("/")),
    ),
  ];
  await Promise.all(
    paths.map(async (path) => {
      const response = await fetch(path, { method: "HEAD", cache: "no-store", redirect: "error" });
      const type = response.headers.get("content-type") || "";
      if (!response.ok || !/^(?:image|audio)\//.test(type))
        throw new Error(`Media was not found: ${path}`);
    }),
  );
  const images = [
    ...new Set([
      record.media.portraitUrl,
      record.media.venueArtworkUrl,
      ...record.celebrations.map((event) => event.image),
    ]),
  ];
  await Promise.all(
    images.map(async (source) => {
      const image = new Image();
      image.src = source;
      try {
        await image.decode();
      } catch {
        throw new Error(
          "A selected photo or artwork could not be decoded. Choose a different image before saving or exporting.",
        );
      }
    }),
  );
}
const slug = (record: WeddingRecord) =>
  `${record.couple.first}-${record.couple.second}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "wedding-order";

export function OwnerEditor() {
  const [draft, setDraft] = useState(createSampleRecord);
  const [section, setSection] = useState<Section>(sections[0]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [message, setMessage] = useState(
    "Start with sample details, or import a saved customer JSON file.",
  );
  const [dirty, setDirty] = useState(false);
  const [previewDirty, setPreviewDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [width, setWidth] = useState("390");
  const [previewStatus, setPreviewStatus] = useState("Loading sample preview…");
  const [revision, setRevision] = useState(0);
  const preview = useRef<HTMLIFrameElement>(null);
  const snapshot = useRef({ record: validateRecord(createSampleRecord()), revision: 0 });
  const editVersion = useRef(0);
  const importInput = useRef<HTMLInputElement>(null);
  const sendPreview = () =>
    preview.current?.contentWindow?.postMessage(
      { type: "wishnote:preview", ...snapshot.current },
      window.location.origin,
    );

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== preview.current?.contentWindow
      )
        return;
      if (event.data?.type === "wishnote:ready") sendPreview();
      if (event.data?.type === "wishnote:applied") setPreviewStatus("Validated draft preview");
      if (event.data?.type === "wishnote:preview-error")
        setPreviewStatus("Preview rejected invalid customer data.");
      if (event.data?.type === "wishnote:media-error")
        setPreviewStatus(
          "A photo, music track, or opening video failed to load. Check selected media.",
        );
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);

  const edit = (next: WeddingRecord | ((current: WeddingRecord) => WeddingRecord)) => {
    editVersion.current += 1;
    setDraft(next);
    setDirty(true);
    setPreviewDirty(true);
    setIssues([]);
  };
  const field = (
    label: string,
    path: string,
    value: string,
    change: (v: string) => WeddingRecord,
    type = "text",
    required = false,
    hint?: string,
  ) => (
    <Field
      key={path}
      label={label}
      value={value}
      onChange={(v) => edit(change(v))}
      type={type}
      required={required}
      hint={hint}
      error={issues.find((i) => i.path === path)?.message}
    />
  );
  const topField = (
    label: string,
    key:
      | "city"
      | "scratchLocation"
      | "memorialLine"
      | "invitationLine"
      | "blessingLine"
      | "homeAddress"
      | "hosts"
      | "rsvp"
      | "wishesFrom",
    type = "text",
    required = false,
  ) => field(label, key, draft[key], (v) => ({ ...draft, [key]: v }), type, required);
  const updateEvent = (index: number, next: WeddingEvent) =>
    edit({ ...draft, celebrations: draft.celebrations.map((e, i) => (i === index ? next : e)) });
  const apply = (record: WeddingRecord, matchesDraft = true) => {
    snapshot.current = { record, revision: snapshot.current.revision + 1 };
    setRevision(snapshot.current.revision);
    setPreviewDirty(!matchesDraft);
    sendPreview();
  };
  const act = async (action: "preview" | "save" | "export") => {
    const version = editVersion.current;
    setBusy(true);
    setIssues([]);
    try {
      const record = validateRecord(draft);
      await checkMedia(record);
      if (action === "preview") {
        apply(record, version === editVersion.current);
        setMessage("Preview updated. Tap the envelope to check the complete entrance animation.");
      }
      if (action === "save") {
        await saveDraft(record);
        setMessage("Draft saved on this browser only. Export JSON as a portable backup.");
      }
      if (action === "export") {
        const url = URL.createObjectURL(
          new Blob([JSON.stringify(record, null, 2)], { type: "application/json" }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slug(record)}.json`;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage("Customer JSON exported. No source files changed and nothing was published.");
      }
      if (action !== "preview" && version === editVersion.current) setDirty(false);
    } catch (error) {
      if (error instanceof ConfigurationError) {
        setIssues(error.issues);
        setMessage("Please fix the validation errors before continuing.");
      } else
        setMessage(
          error instanceof Error ? error.message : "The operation could not be completed.",
        );
    } finally {
      setBusy(false);
    }
  };
  const replaceDraft = (next: WeddingRecord) => {
    edit(next);
    setIssues([]);
    apply(validateRecord(next));
  };

  return (
    <div className="owner-editor">
      <header className="editor-header">
        <a className="editor-brand" href="/owner-editor.html">
          <span className="brand-symbol">
            W<span>✦</span>
          </span>
          <span>
            WishNote<small>OWNER WORKSPACE</small>
          </span>
        </a>
        <span className="local-badge">
          <i /> Local on your computer
        </span>
        <button
          type="button"
          className="secondary-button"
          disabled={busy}
          onClick={() => importInput.current?.click()}
        >
          Import customer JSON
        </button>
        <input
          ref={importInput}
          hidden
          type="file"
          accept=".json,application/json"
          aria-label="Import customer JSON"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            try {
              if (file.size > MAX_RECORD_BYTES)
                throw new Error("Customer JSON must be below 24 MB.");
              const record = validateRecord(JSON.parse(await file.text()));
              replaceDraft(record);
              setMessage("Customer JSON imported locally. Check the preview before exporting.");
            } catch (error) {
              if (error instanceof ConfigurationError) setIssues(error.issues);
              setMessage("Import rejected. Use a valid WishNote version 1 customer JSON file.");
            }
          }}
        />
      </header>
      <div className="editor-title">
        <div>
          <p className="editor-kicker">ONE TEMPLATE. EVERY LOVE STORY.</p>
          <h1>Make it their invitation.</h1>
          <p>Personalize the details. Keep the magic.</p>
        </div>
        <span className="template-chip">Botanical · Original template</span>
      </div>
      <main className="editor-layout">
        <section className="editor-workbench" aria-label="Customer details editor">
          <nav className="editor-tabs" aria-label="Editor sections">
            {sections.map((s, i) => (
              <button
                type="button"
                key={s}
                className={section === s ? "active" : ""}
                aria-current={section === s ? "step" : undefined}
                onClick={() => setSection(s)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s}
              </button>
            ))}
          </nav>
          <div className="editor-form-panel">
            <div className="panel-heading">
              <h2>{section}</h2>
              <span>{dirty ? "Unsaved changes" : "Ready"}</span>
            </div>
            <p className="editor-status" role="status">
              {message}
            </p>
            {issues.length > 0 && (
              <div className="validation-summary" role="alert">
                <strong>Check these details</strong>
                <ul>
                  {issues.map((issue, i) => (
                    <li key={i}>
                      {issue.path}: {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void act("preview");
              }}
              noValidate
            >
              <div className="editor-fields">
                {section === "Couple & date" && (
                  <>
                    {field(
                      "Bride name",
                      "couple.first",
                      draft.couple.first,
                      (v) => ({ ...draft, couple: { ...draft.couple, first: v } }),
                      "text",
                      true,
                    )}
                    {field(
                      "Groom name",
                      "couple.second",
                      draft.couple.second,
                      (v) => ({ ...draft, couple: { ...draft.couple, second: v } }),
                      "text",
                      true,
                    )}
                    {field(
                      "Wedding date",
                      "weddingDate",
                      draft.weddingDate,
                      (v) => moveWeddingDate(draft, v),
                      "date",
                      true,
                      "Changing this date shifts existing functions by the same number of days. Review each time below.",
                    )}
                    {topField("City", "city", "text", true)}
                    {field(
                      "Countdown date & time · IST",
                      "countdownTarget",
                      draft.countdownTarget.slice(0, 16),
                      (v) => ({ ...draft, countdownTarget: `${v}:00+05:30` }),
                      "datetime-local",
                      true,
                    )}
                    {topField("Scratch card location (optional)", "scratchLocation")}
                    <div className="editor-field">
                      <label htmlFor="editor-language">Language</label>
                      <select id="editor-language" value="en" disabled>
                        <option value="en">English</option>
                      </select>
                      <small>
                        Only English is supported by this template. Hindi needs a separately adapted
                        template.
                      </small>
                    </div>
                    <div className="editor-callout wide">
                      Names, dates, initials, scratch card, countdown, event labels and calendar
                      links use the same customer record. All dates and times use Indian Standard
                      Time.
                    </div>
                  </>
                )}
                {section === "Family & wording" && (
                  <>
                    {field(
                      "Bride’s family",
                      "couple.brideParents",
                      draft.couple.brideParents,
                      (v) => ({ ...draft, couple: { ...draft.couple, brideParents: v } }),
                      "textarea",
                    )}
                    {field(
                      "Groom’s family",
                      "couple.groomParents",
                      draft.couple.groomParents,
                      (v) => ({ ...draft, couple: { ...draft.couple, groomParents: v } }),
                      "textarea",
                    )}
                    {field(
                      "Groom’s grandparents (optional)",
                      "couple.groomGrandparents",
                      draft.couple.groomGrandparents,
                      (v) => ({ ...draft, couple: { ...draft.couple, groomGrandparents: v } }),
                    )}
                    {topField("Hosts", "hosts")}
                    {topField("RSVP family names", "rsvp")}
                    {topField("Best wishes from", "wishesFrom")}
                    {topField("Invitation message", "invitationLine", "textarea", true)}
                    <button
                      type="button"
                      className="text-button wide"
                      onClick={() =>
                        edit({
                          ...draft,
                          invitationLine: `Together with our families, ${draft.couple.first} and ${draft.couple.second} invite you to celebrate their wedding.`,
                        })
                      }
                    >
                      Use a message with the current couple’s names
                    </button>
                    {topField("Blessing message", "blessingLine", "textarea")}
                    {topField("Memorial wording (optional)", "memorialLine", "textarea")}
                    {topField("Family / home address (optional)", "homeAddress", "textarea")}
                    {Object.entries({
                      heroMessage: "Hero invitation message",
                      heroFootnote: "Hero blessing line",
                      celebrationsIntro: "Celebrations introduction",
                      closingNote: "Closing message",
                    }).map(([key, label]) =>
                      field(
                        label,
                        `wording.${key}`,
                        draft.wording[key as keyof typeof draft.wording],
                        (v) => ({ ...draft, wording: { ...draft.wording, [key]: v } }),
                        "textarea",
                      ),
                    )}
                  </>
                )}
                {section === "Functions & venues" && (
                  <>
                    <h3 className="wide">Main venue</h3>
                    {field(
                      "Main venue name",
                      "venue.name",
                      draft.venue.name,
                      (v) => ({ ...draft, venue: { ...draft.venue, name: v } }),
                      "text",
                      true,
                    )}
                    {field(
                      "Main Google Maps link",
                      "venue.mapUrl",
                      draft.venue.mapUrl,
                      (v) => ({ ...draft, venue: { ...draft.venue, mapUrl: v } }),
                      "url",
                      false,
                      "Leave blank to generate a Maps search from the venue and address.",
                    )}
                    {field(
                      "Main venue address",
                      "venue.address",
                      draft.venue.address,
                      (v) => ({ ...draft, venue: { ...draft.venue, address: v } }),
                      "textarea",
                      true,
                    )}
                    {draft.celebrations.map((e, index) => (
                      <fieldset className="function-editor wide" key={e.id}>
                        <legend>{e.shortName || e.id}</legend>
                        <div className="function-editor-toolbar">
                          <span>{e.id}</span>
                          {e.id !== "wedding" && (
                            <button
                              type="button"
                              className="text-button"
                              onClick={() =>
                                edit({
                                  ...draft,
                                  celebrations: draft.celebrations.filter((_, i) => i !== index),
                                })
                              }
                            >
                              Remove function
                            </button>
                          )}
                        </div>
                        <div className="editor-fields">
                          {field(
                            "Function name",
                            `celebrations.${index}.shortName`,
                            e.shortName,
                            (v) => ({
                              ...draft,
                              celebrations: draft.celebrations.map((old, i) =>
                                i === index ? { ...old, shortName: v } : old,
                              ),
                            }),
                            "text",
                            true,
                          )}
                          <Field
                            label="Title — subtitle"
                            value={e.title}
                            onChange={(v) => updateEvent(index, { ...e, title: v })}
                            hint="Text after ‘ — ’ appears as the subtitle."
                          />
                          <Field
                            label={`${e.shortName} date & time · IST`}
                            type="datetime-local"
                            value={e.start.slice(0, 16)}
                            required
                            onChange={(v) => updateEvent(index, { ...e, start: `${v}:00+05:30` })}
                            error={
                              issues.find((i) => i.path === `celebrations.${index}.start`)?.message
                            }
                          />
                          <Field
                            label="Function venue"
                            value={e.venue}
                            required
                            onChange={(v) => updateEvent(index, { ...e, venue: v })}
                          />
                          <Field
                            label="Function address"
                            type="textarea"
                            value={e.address}
                            required
                            onChange={(v) => updateEvent(index, { ...e, address: v })}
                          />
                          <Field
                            label="Function Google Maps link"
                            type="url"
                            value={e.mapUrl}
                            onChange={(v) => updateEvent(index, { ...e, mapUrl: v })}
                            hint="Blank generates a venue search."
                          />
                          <Field
                            label="Function message"
                            type="textarea"
                            value={e.supportingLine}
                            onChange={(v) => updateEvent(index, { ...e, supportingLine: v })}
                          />
                          <Field
                            label="Additional timing / pheras (optional)"
                            value={e.phereTime}
                            onChange={(v) => updateEvent(index, { ...e, phereTime: v })}
                          />
                          <button
                            className="text-button wide"
                            type="button"
                            onClick={() =>
                              updateEvent(index, {
                                ...e,
                                venue: draft.venue.name,
                                address: draft.venue.address,
                                mapUrl: draft.venue.mapUrl,
                              })
                            }
                          >
                            Use the main venue for this function
                          </button>
                          <MediaField
                            label={`${e.shortName} artwork`}
                            value={e.image}
                            onChange={(v) =>
                              edit((current) => ({
                                ...current,
                                celebrations: current.celebrations.map((event) =>
                                  event.id === e.id ? { ...event, image: v } : event,
                                ),
                              }))
                            }
                            report={setMessage}
                          />
                        </div>
                      </fieldset>
                    ))}
                    <div className="add-functions wide">
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          edit({
                            ...draft,
                            celebrations: [...draft.celebrations].sort(
                              (a, b) => Date.parse(a.start) - Date.parse(b.start),
                            ),
                          })
                        }
                      >
                        Sort functions by date & time
                      </button>
                      <span>Add a function</span>
                      {eventKinds
                        .filter((id) => !draft.celebrations.some((e) => e.id === id))
                        .map((id) => (
                          <button
                            type="button"
                            className="secondary-button"
                            key={id}
                            onClick={() =>
                              edit({
                                ...draft,
                                celebrations: [
                                  ...draft.celebrations,
                                  sampleEvent(id as EventKind, draft.weddingDate),
                                ],
                              })
                            }
                          >
                            + {id === "mehndi" ? "Mehendi" : id}
                          </button>
                        ))}
                    </div>
                  </>
                )}
                {section === "Photos & artwork" && (
                  <>
                    <p className="editor-callout wide">
                      The portrait and venue artwork keep their existing frames and animation.
                      Upload PNG, JPEG or WebP files up to 8 MB. Uploaded files stay in the browser
                      and are embedded in exported customer JSON.
                    </p>
                    <MediaField
                      label="Couple photo / illustration"
                      value={draft.media.portraitUrl}
                      onChange={(v) =>
                        edit((current) => ({
                          ...current,
                          media: { ...current.media, portraitUrl: v },
                        }))
                      }
                      report={setMessage}
                    />
                    {field(
                      "Photo description",
                      "media.portraitAlt",
                      draft.media.portraitAlt,
                      (v) => ({ ...draft, media: { ...draft.media, portraitAlt: v } }),
                      "text",
                      true,
                    )}
                    <MediaField
                      label="Venue artwork"
                      value={draft.media.venueArtworkUrl}
                      onChange={(v) =>
                        edit((current) => ({
                          ...current,
                          media: { ...current.media, venueArtworkUrl: v },
                        }))
                      }
                      report={setMessage}
                    />
                  </>
                )}
                {section === "Music & extras" && (
                  <>
                    <MediaField
                      label="Background music"
                      kind="audio"
                      value={draft.optional.musicUrl}
                      onChange={(v) =>
                        edit((current) => ({
                          ...current,
                          optional: { ...current.optional, musicUrl: v },
                        }))
                      }
                      report={setMessage}
                    />
                    {field(
                      "Family contact numbers",
                      "contacts",
                      draft.contacts.join("\n"),
                      (v) => ({ ...draft, contacts: v.split("\n") }),
                      "textarea",
                      false,
                      "One phone number per line; leave empty for no contact numbers.",
                    )}
                    {Object.entries({
                      whatsappHostNumber: "WhatsApp host number (country code + number)",
                      travel: "Travel information",
                      stay: "Stay information",
                      contact: "Additional contact information",
                    }).map(([key, label]) =>
                      field(
                        label,
                        `optional.${key}`,
                        draft.optional[key as keyof typeof draft.optional],
                        (v) => ({ ...draft, optional: { ...draft.optional, [key]: v } }),
                        key === "whatsappHostNumber" ? "tel" : "textarea",
                      ),
                    )}
                  </>
                )}
                {section === "Save & export" && (
                  <>
                    <div className="export-guide wide">
                      <h3>A customer order, without code edits.</h3>
                      <ol>
                        <li>Complete the details and update the preview.</li>
                        <li>Save locally for later, and export the customer JSON as a backup.</li>
                        <li>Build a new, isolated invitation folder with the command below.</li>
                        <li>
                          Review that folder on localhost before manually publishing to a new
                          destination.
                        </li>
                      </ol>
                      <code>
                        npm run build:invitation -- --config "/path/to/{slug(draft)}.json" --outDir
                        "build-orders/{slug(draft)}"
                      </code>
                      <p>
                        Choose a new output folder for every revision. Existing output and the
                        original customer configuration are never overwritten.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={busy}
                      onClick={() => void act("save")}
                    >
                      Save local draft
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={busy}
                      onClick={() => void act("export")}
                    >
                      Export customer JSON
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={busy}
                      onClick={async () => {
                        try {
                          const saved = await loadDraft();
                          if (saved) {
                            replaceDraft(saved);
                            setDirty(false);
                            setMessage("Saved local draft restored.");
                          } else setMessage("No local draft has been saved yet.");
                        } catch (error) {
                          setMessage(
                            error instanceof Error
                              ? error.message
                              : "Could not restore local draft.",
                          );
                        }
                      }}
                    >
                      Restore local draft
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        if (
                          !dirty ||
                          window.confirm("Replace unsaved changes with fictional sample details?")
                        ) {
                          replaceDraft(createSampleRecord());
                          setMessage("New order started with fictional sample details.");
                        }
                      }}
                    >
                      New sample order
                    </button>
                    <button
                      type="button"
                      className="text-button wide"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Delete the saved draft from this browser? Export a backup first.",
                          )
                        ) {
                          try {
                            await clearDraft();
                            setMessage(
                              "Saved browser draft deleted. The current form remains open.",
                            );
                          } catch {
                            setMessage("Could not delete the saved draft.");
                          }
                        }
                      }}
                    >
                      Delete saved browser draft
                    </button>
                    <p className="editor-callout wide">
                      This tool has no publishing connection. Customer JSON and build folders
                      contain private information: keep them out of Git and public file sharing.
                      Only the final approved invitation should be published.
                    </p>
                  </>
                )}
              </div>
              <footer className="editor-form-footer">
                <span>Nothing is published automatically.</span>
                <button className="primary-button" type="submit" disabled={busy}>
                  {busy ? "Checking…" : "Update preview"}
                  <span aria-hidden="true"> ↗</span>
                </button>
              </footer>
            </form>
          </div>
        </section>
        <aside className="editor-preview-panel" aria-label="Personalized invitation preview">
          <div className="preview-toolbar">
            <div>
              <span className="editor-kicker">YOUR INVITATION</span>
              <h2>A little look ahead.</h2>
            </div>
            <select
              aria-label="Preview width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            >
              <option value="390">Mobile</option>
              <option value="768">Tablet</option>
              <option value="1200">Desktop</option>
            </select>
          </div>
          <p className="preview-status" role="status">
            {previewDirty ? "Form changed · update preview to see your changes" : previewStatus}
          </p>
          <div className="preview-stage">
            <iframe
              ref={preview}
              src="/owner-preview.html"
              title="Personalized wedding invitation preview"
              style={{ width: `${width}px` }}
            />
          </div>
          <div className="preview-footer">
            <span>Draft {revision + 1} · English · IST</span>
            <button
              type="button"
              className="text-button"
              onClick={() => apply(snapshot.current.record, !previewDirty)}
            >
              Replay preview
            </button>
          </div>
        </aside>
      </main>
      <footer className="editor-bottom">
        Made for love stories. Built for a simpler working day.
        <span>Private localhost tool · No customer data sent to a server</span>
      </footer>
    </div>
  );
}
