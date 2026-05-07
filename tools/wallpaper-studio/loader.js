/**
 * Wallpaper loader for .wallpaper files
 */
class WallpaperLoader {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  async load(file) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    const magic = bytes.slice(0, 4);
    if (new TextDecoder().decode(magic) !== 'DWAL') {
      throw new Error('Invalid wallpaper file');
    }

    const sizeView = new DataView(bytes.buffer, 4, 4);
    const size = sizeView.getUint32(0, true);
    const jsonBytes = bytes.slice(8, 8 + size);
    const json = new TextDecoder().decode(jsonBytes);
    
    return JSON.parse(json);
  }

  run(data) {
    if (data.config) {
      this.applyConfig(data.config);
    }
  }

  applyConfig(config) {
    // Apply config to generate wallpaper
    console.log('Applying config:', config);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WallpaperLoader;
}