# HD media and compression

The first template's Wedding Ceremony and Reception cards use enhanced artwork. All CSS references to the old 200 × 300 ornament now use the enhanced ceremony image. Updated filenames ensure browsers request the new assets after deployment.

| Active media | Previous bytes | Optimized bytes | Dimensions |
| --- | ---: | ---: | --- |
| `public/assets/envelope-opening-hd-v2.mp4` | 6,068,980 | 3,301,614 | 1080 × 1920, 24 fps |
| `public/assets/entrance-courtyard-hd-v2.webp` | 553,646 | 328,312 | 941 × 1672 |
| `public/assets/wedding-ceremony-hd-v2.webp` | 531,456 | 398,562 | 938 × 1676 |
| `public/assets/couple-illustration.webp` | 236,819 | 121,110 | 375 × 533, lossless visible pixels |
| `public/assets/wedding-share-cover-v2.jpg` | 184,390 | 136,684 | 1200 × 630 |

`public/assets/reception-hd.webp` is a new 1122 × 1402 enhancement of the 783 × 980 original. It is 141,764 bytes. This higher-resolution replacement is slightly larger than the old 117,604-byte JPEG, while remaining small for its dimensions.

The original 1080 × 1920 entrance JPEG poster was retained because tested high-quality re-encodes were larger. Three legacy MP4 paths also contain the compressed video, while the active player uses the new filename. The two earlier HD WebP filenames contain the compressed exports as well.

## Encoding and verification

- Reception restoration: built-in imagegen, with the exact prompt below. Original courtyard and ceremony restoration prompts are in `image-enhancements.md`.
- Images: Sharp WebP with effort 6 and smart chroma subsampling. Quality 84 for the courtyard, 88 for the ceremony, and 86 for reception. No resizing or interpolation. The couple illustration uses lossless WebP; visible pixels were verified identical after compositing on the invitation paper color. The share cover remains JPEG for social preview compatibility.
- MP4: FFmpeg/libx264, preset `slow`, CRF 26, High profile, `yuv420p`, and `+faststart`. Resolution and frame rate are unchanged. The original AAC audio stream is copied without re-encoding.
- The encoded MP4 measures 0.984245 SSIM against the original video. This structural similarity measurement is combined with visual frame inspection and browser playback checks; it does not imply pixel identity.
- Other large legacy JPEGs were compressed only when the result saved more than 5% at the same dimensions. Full measurements are in `media-optimization.json`.

## Final Reception enhancement prompt

Use case: restoration. Edit target: the supplied Reception wedding-card ornament. Restore this exact original design in high definition: clean warm antique-gold geometric diagonal jali lattice across the upper portion, a single symmetrical broad pointed Mughal arch centered below the lattice, and a deep midnight-navy lower background with its subtle tone-on-tone pattern. Preserve the arch outline, original proportions and 4:5 portrait composition, color palette, arrangement, and simple geometric style; do not introduce floral filigree or change the design. Recover sharp, continuous gold linework with consistent widths, precise arch edges, detailed but restrained gold surface shading, and a smooth rich navy background without JPEG blur or compression. Keep the full asset visible. Highest available native resolution, preferably 1600x2000 or larger, suitable for high-density phone displays. No text, names, logos, people, badges, watermarks, or added objects.
