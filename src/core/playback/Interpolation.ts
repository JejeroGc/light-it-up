export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(value, min),
    max
  );
}

export function lerp(
  start: number,
  end: number,
  progress: number
): number {
  const t = clamp(
    progress,
    0,
    1
  );

  return (
    start +
    (end - start) * t
  );
}

export function lerpHexColor(
  startColor: string,
  endColor: string,
  progress: number
): string {
  const t = clamp(
    progress,
    0,
    1
  );

  const start =
    hexToRgb(startColor);

  const end =
    hexToRgb(endColor);

  const red = Math.round(
    lerp(
      start.red,
      end.red,
      t
    )
  );

  const green = Math.round(
    lerp(
      start.green,
      end.green,
      t
    )
  );

  const blue = Math.round(
    lerp(
      start.blue,
      end.blue,
      t
    )
  );

  return rgbToHex(
    red,
    green,
    blue
  );
}

function hexToRgb(
  color: string
): {
  red: number;
  green: number;
  blue: number;
} {
  const normalized =
    normalizeHex(color);

  const numericValue =
    Number.parseInt(
      normalized.slice(1),
      16
    );

  return {
    red:
      (numericValue >> 16) &
      255,

    green:
      (numericValue >> 8) &
      255,

    blue:
      numericValue & 255,
  };
}

function rgbToHex(
  red: number,
  green: number,
  blue: number
): string {
  const safeRed = clamp(
    Math.round(red),
    0,
    255
  );

  const safeGreen = clamp(
    Math.round(green),
    0,
    255
  );

  const safeBlue = clamp(
    Math.round(blue),
    0,
    255
  );

  return `#${[
    safeRed,
    safeGreen,
    safeBlue,
  ]
    .map((value) =>
      value
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

function normalizeHex(
  color: string
): string {
  const value =
    color.trim();

  if (
    /^#[0-9a-fA-F]{6}$/.test(
      value
    )
  ) {
    return value;
  }

  if (
    /^#[0-9a-fA-F]{3}$/.test(
      value
    )
  ) {
    const red = value[1];
    const green = value[2];
    const blue = value[3];

    return `#${red}${red}${green}${green}${blue}${blue}`;
  }

  return "#ffffff";
}