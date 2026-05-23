/**
 * Deepiri Lyback Version Info
 */
const VERSION = '1.0.0';
const VERSION_INFO = {
  major: 1,
  minor: 0,
  patch: 0,
  build: 'release'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VERSION, VERSION_INFO };
}