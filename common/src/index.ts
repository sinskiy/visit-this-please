export function jsonStringifyFormatted(value: unknown) {
  return JSON.stringify(value, null, 4);
}
