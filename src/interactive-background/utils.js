/**
 * Utility functions for Deepiri Lyback
 */
const Utils = {
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  },

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}