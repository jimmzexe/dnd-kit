import type {Transform} from './parseTransform.js';

export function stringifyTransform({x, y, z, scaleX, scaleY}: Transform) {
  return `translate3d(${x}px, ${y}px, ${z ?? 0}) scale(${scaleX}, ${scaleY})`;
}
