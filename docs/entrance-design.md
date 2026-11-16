# Wedding entrance

The couple asset is saved at `public/assets/couple-illustration-v1.png`.
It was prepared using the built-in image generation tool from the supplied flat couple illustration. The supplied couple illustration is a still image; its framing is implemented in React, Motion, and CSS.

The entrance displays a closed envelope and only the label “Tap to open”. Clicking or touching the fullscreen envelope plays the exact supplied `Shristi-and-Harsha-Wedding-/public/envelope-open.mp4`, normalized for Safari at `public/assets/envelope-opening-safari.mp4` with all 94 original frames, constant 24 fps, H.264 Main, and fast-start metadata; the source MP4 edit list is removed. There are no added arrows, captions, sparkles, or controls over the opening video. Playback explicitly resets to frame zero on each tap, and media errors offer a retry instead of silently skipping the video. The video plays once in full; its `ended` event starts the existing fade into the live website.

## Gold effects

`SparkleField.tsx` adds small champagne-gold particles and slow four-point glints to the opening, hero, and celebration section. Particles stay near the edges and ignore pointer events. Each field pauses when it leaves the viewport; phones show fewer particles and glints. A travelling gold highlight traces the couple’s arch, while the ampersand has a gentle metallic shimmer. Celebration cards get a brief light sweep on hover. Reduced-motion mode hides the sparkle fields and disables the decorative frame, glow, and lettering animations.

The supplied recording and synchronized video-to-page dissolve remain independent of the decorative sparkle effects.

## Asset preparation prompt

Use case: background-extraction. Asset type: transparent cutout for a premium wedding invitation website. Edit target: the provided SMALL FLAT FACELESS COUPLE ILLUSTRATION: woman on the left with long black hair, sage embroidered blouse and long flared deep teal skirt, man on the right wearing a dark navy sherwani and cream trousers, leaning his head affectionately against hers. Ignore the two real photographic couple images; these are NOT the edit target. Remove only the plain white background of the flat illustration. Preserve the illustration's original pose, clean flat-vector-like drawing, faceless heads, clothing colours, body proportions, skirt silhouette and outfit details as closely as possible. Full-length isolated couple, both feet and entire skirt visible, tall portrait crop with small transparent padding. No new objects, no additional scene, no text, no realism, no 3D, no shadows or background. Output genuinely transparent PNG with clean edges.
