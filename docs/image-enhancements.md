# Entrance and Wedding Ceremony image enhancements

Created with the built-in imagegen tool. The original assets remain available.

## Exported assets

- `public/assets/entrance-courtyard-hd.webp`: 941 × 1672, optimized WebP export. Used over the compressed courtyard in the final 0.8 seconds of the entrance video and during its existing dissolve into the invitation. The gate animation remains in place; if the new image has not loaded, the original video remains visible.
- `public/assets/wedding-ceremony-hd.webp`: 938 × 1676, optimized WebP export. Replaces the 200 × 300 ornament in the Wedding Ceremony card. The footer fade is shortened to retain the navy background and gold border detail.

The image generator returned the native dimensions above; the exports retain those dimensions without interpolation.

## Final prompts

### Entrance courtyard

Use case: restoration. Edit target: the supplied portrait nighttime palace courtyard image used as the final entrance scene in a wedding invitation. Restore and enhance this exact image in high definition, preserving the exact viewpoint, composition, architecture, central fountain and water channel, symmetrical staircases, hedges, warm golden lighting, and midnight blue starry sky. Sharpen the stone carvings, balustrades, windows, fountain basin and individual water streams and reflections. Restore clearly separated pinpoint stars and a smooth deep-blue night sky, removing blocky compression noise and blur. Balanced natural contrast, controlled highlight glow, crisp fine details without halos or crunchy sharpening. Keep the original navy and gold palette and same palace, no new objects, no people added, no lettering, no logos or watermarks. Preserve the tall 9:16 framing with the starry sky above and courtyard fountain below. Highest available native resolution, intended for a full-screen high-density mobile entrance image; ideally 2160x3840.

### Wedding Ceremony ornament

Use case: restoration. Image 1 is the edit target: preserve its complete portrait frame, symmetrical ornate golden Islamic geometric filigree border and distinctive pointed keyhole/multifoil arch silhouette. Image 2 is only the reference for the desired stronger contrast, midnight navy background and clean warm antique-gold edges. Produce a high-definition faithful restoration of image 1 with sharply resolved gold lattice and engraving, smooth dark navy infill instead of the washed-out muddy gray, and clear separation of the border and central background. The very fine ornament must read cleanly at small card widths with controlled crisp edges and no bloom. Maintain the original frame design and portrait proportions of image 1, full border visible on all four sides, highest available native resolution, ideally at least 1600x2400. This is a decorative wedding ceremony card asset. No text, no names, no badges, no new symbols, no people or buildings. Retain the rich navy-and-gold visual character shared with image 2.

Inputs: `public/assets/hero-bg-endframe.jpg` (courtyard edit target), `public/assets/midnight-jali-motif-1.jpg` (ornament edit target), and `public/assets/midnight-jali-decor.jpg` (contrast reference).
