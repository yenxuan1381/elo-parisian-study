import * as T from 'three';

export const pageMetrics = { pixels: 2000, width: 800, margin: 64, character: 14.4, top: 360, line: 34, bottom: 30 };
export const pageTitle = 'Write anything and send to Emily';
export const columns = Math.floor((pageMetrics.width - pageMetrics.margin * 2) / pageMetrics.character);

// Retain every paragraph, including empty lines and trailing returns. Wrapping is
// presentation only; the original message is what gets sent by email.
export function layoutLetter(text: string) {
 const lines: string[] = [];
 for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
  let remaining = Array.from(paragraph);
  while (remaining.length > columns) {
   let at = remaining.lastIndexOf(' ', columns);
   if (at < 1) at = columns;
   lines.push(remaining.slice(0, at).join(''));
   remaining = remaining.slice(at + (remaining[at] === ' ' ? 1 : 0));
  }
  lines.push(remaining.join(''));
 }
 const row = lines.length - 1;
 const baseline = pageMetrics.top + row * pageMetrics.line + pageMetrics.line / 2;
 return { lines, row, column: Array.from(lines[row]).length, baseline, height: baseline + pageMetrics.bottom };
}

// Fit every corner, including depth, rather than estimating from the screen width.
export function fittedDistance(bounds: T.Box3, center: T.Vector3, outward: T.Vector3, aspect: number, fov: number) {
 const right = new T.Vector3().crossVectors(new T.Vector3(0, 1, 0), outward).normalize();
 const up = new T.Vector3().crossVectors(outward, right).normalize();
 const tanY = Math.tan(T.MathUtils.degToRad(fov / 2)) * .87;
 const tanX = tanY * aspect;
 let distance = 0;
 for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
  const relative = new T.Vector3(x, y, z).sub(center);
  distance = Math.max(distance, relative.dot(outward) + Math.max(Math.abs(relative.dot(right)) / tanX, Math.abs(relative.dot(up)) / tanY));
 }
 return Math.max(.65, distance);
}
