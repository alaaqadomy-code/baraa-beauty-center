// Tiny, safe minifiers (no deps)
export const minify = {
  html: s => s.replace(/>\s*\n\s*</g, '><').replace(/\n\s+/g, '\n').trim(),
  css: s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim(),
};
