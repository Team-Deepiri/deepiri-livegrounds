/**
 * Deepiri Lyback Configuration Defaults
 */
const DEEPIRI_DEFAULTS = {
  TARGET_FPS: 30,
  MAX_PARTICLES: 200,
  MIN_PARTICLES: 50,
  MAX_PARTICLES_LIMIT: 500,
  DEFAULT_COLORS: [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#ffeaa7',
    '#dfe6e9'
  ],
  DEFAULT_BG_COLOR: '#0d0d14',
  DEFAULT_PARTICLE_SIZE: 6,
  DEFAULT_SPEED: 3,
  GRID_SIZE: 50,
  MOUSE_INTERACTION_RADIUS: 100,
  CLICK_BURST_COUNT: 30
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEEPIRI_DEFAULTS };
}