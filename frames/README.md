# frames/ — optional scroll-scrubbed portrait

Drop your portrait sequence in this folder. The page plays it like a video as
you scroll: **frame_0001.jpg** → **frame_0120.jpg** (120 frames, zero-padded to
four digits).

If `frames/frame_0001.jpg` is missing, the page automatically falls back to the
single photo `assets/me.jpeg` and simulates the four poses with canvas
transforms (front → turned right → turned left → close-up). Nothing breaks, so
you can deploy before the frames exist.

## Generating frames from an AI video

Record or generate a short clip where the head turns right, then left, then
leans in, then export it frame by frame:

```bash
ffmpeg -i video.mp4 -vf "fps=20,scale=1280:-1" -q:v 4 frames/frame_%04d.jpg
```

- `fps=20` gives 20 frames per second; a 6-second clip → 120 frames.
- `scale=1280:-1` keeps the width at 1280px and preserves the aspect ratio.
- `-q:v 4` is good JPEG quality; `2`–`6` trade size for quality.

Then adjust the two constants at the top of the `<script>` block in
`index.html` if your sequence is a different length:

```js
const FRAME_COUNT = 120;
```

Source `.mp4` files are ignored by git (see `.gitignore`) — they are large and
are only needed once, to export the frames.

## Keep the folder small

120 JPEGs at 1280px wide and quality 4 land around 10–20 MB, which GitHub Pages
serves happily. If a single frame is over ~400 KB, re-export with a lower `-q:v`
or a smaller `scale=960:-1`.