export const MOBILE_LAYOUT_BREAKPOINT = 760;

export function isPortraitPhoneViewport(width, height) {
  return width > 0 && height > 0 && width <= MOBILE_LAYOUT_BREAKPOINT && height >= width;
}

export function shouldRotateBoardForMobile(width, height, rows, cols) {
  return isPortraitPhoneViewport(width, height) && cols > rows;
}
