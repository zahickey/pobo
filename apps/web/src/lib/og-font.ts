// next/og (satori) can't use CSS font-family names directly — it needs the
// actual font binary. This pulls just the glyphs the image needs from
// Google Fonts' CSS API, which is the documented pattern for ImageResponse.
export async function loadGoogleFont(family: string, text: string): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const fontUrl = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/)?.[1];

  if (!fontUrl) {
    throw new Error(`Could not resolve a font file URL for "${family}" from Google Fonts`);
  }

  const fontResponse = await fetch(fontUrl);
  return fontResponse.arrayBuffer();
}
