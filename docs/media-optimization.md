# HD media and compression

The opening uses the regenerated video, compressed at its original 1080 × 1920 resolution and 24 fps. It plays through normally, with no courtyard image overlay. Updated filenames ensure browsers request the optimized video and music after deployment.

| Current asset | Before | Now | Settings |
| --- | ---: | ---: | --- |
| `public/assets/envelope-opening-hd-v4.mp4` | 8,573,939 bytes | 5,190,490 bytes | H.264, slow preset, CRF 23, yuv420p, fast-start |
| `public/assets/kudmayi-96k.m4a` | 4,177,638 bytes | 3,213,463 bytes | Stereo AAC, 96 kbps target, fast-start |

Together these reduce active media bytes by 4,347,624 (about 31%). The nine active media files, including the social preview, now total 9,760,445 bytes. This is a complete-file total, not a measured initial page transfer; browsers can fetch audio/video in ranges.

The video retains all 119 frames and its 4.958333-second duration. Its unused embedded audio was removed because the opening player is muted and the invitation plays its separate background music. The music retains its full duration (approximately 4 minutes 21 seconds) and stereo channels. Both MP4 containers place playback metadata before media data for progressive playback.

The 16 previously excluded legacy files have now been deleted from `public/`, removing 15,409,074 bytes of unused source assets. The superseded v3 video and MP3 were also removed after the smaller replacements decoded successfully. The build no longer needs the exclusion list. Exact removed paths and measurements are recorded under `currentDelivery` in `media-optimization.json`; earlier entries are historical measurements.

## Images retained

| Active image | Bytes | Dimensions |
| --- | ---: | --- |
| `public/envelope-poster.jpg` | 227,650 | 1080 × 1920 |
| `public/assets/entrance-courtyard-hd-v2.webp` | 328,312 | 941 × 1672 |
| `public/assets/wedding-ceremony-hd-v2.webp` | 398,562 | 938 × 1676 |
| `public/assets/couple-illustration.webp` | 121,110 | 375 × 533, lossless visible pixels |
| `public/assets/reception-hd.webp` | 141,764 | 1122 × 1402 |
| `public/assets/wedding-share-cover-v2.jpg` | 136,684 | 1200 × 630 |
| `public/favicon.png` | 2,410 | 96 × 96 |

All seven image files remain byte-identical. The poster WebP trial was larger than its JPEG. The courtyard and reception trials offered negligible savings. Compressing the portrait further changed fine details, so the existing lossless WebP remains. The social cover retains JPEG for sharing compatibility.

## Verification

- Both optimized files decoded fully with FFmpeg without errors.
- ffprobe verified codecs, dimensions, frame rate and durations; MP4 atom inspection verified fast-start metadata.
- The video measures 0.988494 SSIM against the regenerated source. This structural similarity measurement does not imply pixel identity. A frame comparison at phone viewing size showed preserved fine gold detail; the encode is lossy.
- Image hashes were checked against the pre-change files.
- The earlier artwork generation and restoration prompts are recorded in `image-enhancements.md`; its legacy input paths describe historical source files.

## Final Reception enhancement prompt

Use case: restoration. Edit target: the supplied Reception wedding-card ornament. Restore this exact original design in high definition: clean warm antique-gold geometric diagonal jali lattice across the upper portion, a single symmetrical broad pointed Mughal arch centered below the lattice, and a deep midnight-navy lower background with its subtle tone-on-tone pattern. Preserve the arch outline, original proportions and 4:5 portrait composition, color palette, arrangement, and simple geometric style; do not introduce floral filigree or change the design. Recover sharp, continuous gold linework with consistent widths, precise arch edges, detailed but restrained gold surface shading, and a smooth rich navy background without JPEG blur or compression. Keep the full asset visible. Highest available native resolution, preferably 1600x2000 or larger, suitable for high-density phone displays. No text, names, logos, people, badges, watermarks, or added objects.
