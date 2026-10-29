/** Convert numeric strings while leaving invalid values for DTO validation. */
export function toNumber(value: unknown): unknown {
  if (typeof value !== 'string' || value.trim() === '') {
    return value;
  }

  // HTTP clients send decimal values; reject JavaScript-specific hex/binary forms.
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) {
    return value;
  }

  return Number(value);
}
