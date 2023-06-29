export function isMobile(): boolean {
  return /Android|iPhone/i.test(navigator.userAgent);
}
