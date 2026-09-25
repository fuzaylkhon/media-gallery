const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;

export function formatBytes(bytes: number) {
  const exponent = Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)));
  return new Intl.NumberFormat(undefined, {
    style: 'unit',
    unit: BYTE_UNITS[exponent] ?? 'byte',
    unitDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(bytes / 1024 ** exponent);
}
