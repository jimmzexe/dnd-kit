import {getWindow} from '../execution-context/getWindow.js';

export function isScrollable(
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration = getWindow(element).getComputedStyle(
    element
  )
): boolean {
  const overflowRegex = /(auto|scroll|overlay)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];

  return (
    properties.find((property) => {
      const value = computedStyle[property as keyof CSSStyleDeclaration];

      return typeof value === 'string' ? overflowRegex.test(value) : false;
    }) != null
  );
}
