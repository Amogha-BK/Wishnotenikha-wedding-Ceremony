# WishNote local customer editor

The current botanical invitation is now a renderer of a versioned customer record. Normal orders change data, not React components. No catalogue, Supabase system, public deployment, or existing customer configuration is changed by the editor.

## Open the owner workspace

Run `npm run editor`, then open **http://127.0.0.1:8444/owner-editor.html** on the same computer. Stop the server with Ctrl+C when finished. Node 22.18+ is recommended (the project uses Node 22).

The dedicated server binds only to loopback. Editor HTML and source entry points reject non-local hosts, addresses and cross-origin requests. The normal dev server does not enable the editor, and ordinary production builds do not include its entry points. This is a tool for the owner operating their computer, not a hosted login/admin system. Do not forward its port or publish its source directory.

The editor starts with fictional sample details. It never loads the existing customer's configuration. One validated draft can be saved in IndexedDB in this browser; use **Restore local draft** to reopen it. Saving is explicit, not automatic. JSON export is the portable backup. Browser storage can be cleared or run out of space, so export before closing an important order.

## Create an order

1. Enter bride/groom names, wedding date and city. Changing the wedding date shifts the existing functions and countdown by the same number of days; review each function's date and time.
2. Enter family wording, hosts, invitation message and optional memorial/blessing text. The button below the invitation message inserts the current names; custom prose is never rewritten automatically.
3. Edit the main venue and each function's venue independently, or select **Use the main venue for this function**. A blank Maps link generates a search from the address. Existing explicit links stay unchanged when an address is edited; clear or update them when the venue changes.
4. Add/remove Mehendi, Haldi, Sangeet and Reception as needed. The Wedding function is required. Functions display in the order shown; use **Sort functions by date & time** after adding functions if necessary. Set times in IST; display labels and calendar links are derived from those times.
5. Upload the couple photo/illustration, venue artwork and function artwork, or choose existing `/assets/` paths. PNG/JPEG/WebP uploads up to 8 MB are embedded in JSON. The existing portrait frame remains in place; check cropping with the actual photo. Music is optional and supports a local asset path or an embedded audio upload. The opening video remains the template's existing clip.
6. Select **Update preview**. Tap the envelope to test the original entrance, then check all dates, photos, functions, scratch card, directions and music on mobile and desktop widths. Previewing does not save the form. Use **Replay preview** to restart the last applied version.
7. Save locally if needed and select **Export customer JSON**. Store it privately, outside `public/`; `customer-data/` and `build-orders/` are Git-ignored. Do not commit customer records or uploaded personal media.

English is the only supported language in this template. The language control is intentionally disabled. The sibling Hindi application is not connected or modified.

## Build a separate invitation

From the repository root:

```sh
npm run build:invitation -- --config "/absolute/path/to/order.json" --outDir "build-orders/order-id"
```

Choose a **new** output directory for every revision. The command refuses existing output directories and writes only below `build-orders/`. It validates JSON again, uses it as the build's customer record, and leaves `src/invitationConfig.ts` untouched. It does not create a copy of the application per customer.

Only shared template assets and explicitly selected media are copied into this build. The original customer's full `public/` folder is not copied. Inherited customer metadata is replaced; customer builds default to `noindex, nofollow` and have no inherited social image, canonical URL, favicon or analytics. Check metadata before choosing to make a final invitation public. Uploaded media embedded in JSON is compiled into the invitation; larger music files increase the download size.

Review the resulting static build locally:

```sh
npm run preview -- --outDir build-orders/order-id --host 127.0.0.1 --port 8445
```

Open http://127.0.0.1:8445 and repeat the customer checks. Check the generated HTML title and description and verify that only this order's assets/details are present. Do not share a localhost editor URL with customers. A shared draft requires a separately protected hosting destination, which is outside this implementation.

Nothing deploys automatically. After customer approval, manually upload **only this order's build folder** to a new, explicitly selected hosting destination. Do not deploy from the original customer's linked Vercel project or change its production alias. The existing `vercel.json` still builds the original invitation with `npm run build`.

## Architecture and future templates

- `src/invitation/schema.ts`: framework-independent `WeddingRecord` version 1, validation, IST date helpers, and the existing template adapter.
- `src/invitation/defaultRecord.ts`: reads the legacy configuration for the original invitation only.
- `src/invitation/InvitationContext.tsx`: supplies a selected record's derived configuration to the existing components.
- `src/editor/`: owner form, browser-only draft storage and isolated iframe preview. Preview records travel in same-origin `postMessage` messages, never in URLs or network payloads.
- `scripts/wishnotePlugin.ts`: build-time record injection, local-only editor access and customer build asset/metadata isolation.
- `scripts/build-invitation.mjs`: validates the build workflow and preserves previous build folders.

The first template ID is `botanical`. Future templates should accept the same customer record through a template registry and use their own presentation adapter and components. Keep event/customer data shared, with animations and colours owned by the template. Unknown template IDs and languages are rejected today. There is no multi-template publishing system in this phase.

Codex/developer work is still needed for a new template, new language, new features/fields, design changes, replacing the opening clip with a different interaction, or unexpected bugs. Routine names, family wording, date/time, functions, venues, photos and music use the editor.

## Checks

```sh
npm test
npm run typecheck
npm run build
```

The schema tests use fictional sample records and cover invalid dates, IST boundaries, optional fields, all five functions, duplicate/missing functions, imported data, unsafe URLs and unsupported languages/templates. Existing countdown regression tests remain in place. Browser verification should also cover the original video entrance and replay, uploads, local draft restoration, JSON round trip and a personalized static build.

The invitation retains its existing Google Fonts stylesheet. Customer text and uploaded media are not sent to a service; loading the existing font stylesheet may still require internet access. External photo/music URLs are deliberately rejected to keep draft media local.
