
function rgbToHex(r, g, b) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}

function redistributeRGB(r, g, b) {
  const threshold = 255.999;
  const m = Math.max(r, g, b);

  if (m <= threshold) {
    return [Math.floor(r), Math.floor(g), Math.floor(b)];
  }

  const total = r + g + b;
  if (total >= 3 * threshold) {
    return [Math.floor(threshold), Math.floor(threshold), Math.floor(threshold)];
  }

  const x = (3 * threshold - total) / (3 * m - total);
  const gray = threshold - x * m;

  return [
    Math.floor(gray + x * r),
    Math.floor(gray + x * g),
    Math.floor(gray + x * b)
  ];
}

function brighten(hex, b) {
  let val = hexToRgb(hex)
  val = rgbToHsl(val[0], val[1], val[2])
  val[2] = val[2] * (b+1)
  val = hslToRgb(val[0], val[1], val[2])
  return rgbToHex(val[0], val[1], val[2])
}