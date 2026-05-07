/**
 * Predefined wallpaper presets
 */
const PRESETS = {
  ocean: {
    name: 'Ocean Breeze',
    colors: ['#0077be', '#00a8e8', '#00b4d8', '#48cae4', '#90e0ef', '#caf0f8'],
    bgColor: '#03045e',
    particleCount: 150,
    speed: 2
  },
  fire: {
    name: 'Fire Storm',
    colors: ['#ff0000', '#ff4500', '#ff6600', '#ff9900', '#ffcc00', '#ff3300'],
    bgColor: '#1a0000',
    particleCount: 200,
    speed: 4
  },
  forest: {
    name: 'Forest Mist',
    colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7'],
    bgColor: '#081c15',
    particleCount: 120,
    speed: 2
  },
  neon: {
    name: 'Neon Night',
    colors: ['#ff00ff', '#00ffff', '#ff006e', '#00f5d4', '#fee440', '#9b5de5'],
    bgColor: '#0a0a0a',
    particleCount: 250,
    speed: 5
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRESETS;
}