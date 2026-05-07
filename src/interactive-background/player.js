const InteractivePlayer = (() => {
  const MAGIC = 'IBG1';

  class Player {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.engine = null;
      this.payload = null;
    }

    async loadFromFile(file) {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      if (file.type === 'image/png') {
        return this.loadFromPNG(bytes);
      } else if (file.type === 'image/webp') {
        return this.loadFromWebP(bytes);
      } else if (file.type === 'image/bmp') {
        return this.loadFromBMP(bytes);
      } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        return this.loadFromJPG(bytes);
      }

      return this.loadImageFallback(file);
    }

    loadFromPNG(bytes) {
      const endMarker = new TextEncoder().encode('IEND');
      const endIdx = this.findBytes(bytes, endMarker);
      if (endIdx === -1) return this.loadImageFallback(new Blob([bytes]));

      const magicBytes = new TextEncoder().encode(MAGIC);
      const searchStart = endIdx + 8;

      for (let i = searchStart; i < bytes.length - 20; i++) {
        const chunk = bytes.slice(i, i + 4);
        if (new TextDecoder().decode(chunk) === MAGIC) {
          const length = (bytes[i + 4] << 24) | (bytes[i + 5] << 16) | (bytes[i + 6] << 8) | bytes[i + 7];
          const payloadBytes = bytes.slice(i + 8, i + 8 + length);
          const payload = new TextDecoder().decode(payloadBytes);
          return this.initFromPayload(payload);
        }
      }

      return this.loadImageFallback(new Blob([bytes], { type: 'image/png' }));
    }

    loadFromWebP(bytes) {
      const magicBytes = new TextEncoder().encode(MAGIC);
      const idx = this.findBytes(bytes, magicBytes);
      if (idx === -1) return this.loadImageFallback(new Blob([bytes], { type: 'image/webp' }));

      const metaIdx = idx + 4;
      let endIdx = metaIdx;
      for (let i = metaIdx; i < bytes.length - 4; i++) {
        if (bytes[i] === 77 && bytes[i + 1] === 69 && bytes[i + 2] === 84 && bytes[i + 3] === 65) {
          endIdx = i;
          break;
        }
      }

      const payloadBytes = bytes.slice(metaIdx, endIdx);
      const payload = new TextDecoder().decode(payloadBytes);
      return this.initFromPayload(payload);
    }

    loadFromBMP(bytes) {
      const view = new DataView(bytes.buffer);
      const dataOffset = view.getUint32(10, true);
      const payloadOffset = dataOffset + 4;

      const magicBytes = new TextEncoder().encode(MAGIC);
      let payloadStart = -1;

      for (let i = payloadOffset; i < bytes.length - 4; i++) {
        if (bytes[i] === 73 && bytes[i + 1] === 66 && bytes[i + 2] === 71 && bytes[i + 3] === 49) {
          payloadStart = i - 4;
          break;
        }
      }

      if (payloadStart === -1) {
        return this.loadImageFallback(new Blob([bytes], { type: 'image/bmp' }));
      }

      const metaIdx = payloadStart + 8;
      let endIdx = metaIdx;
      for (let i = metaIdx; i < bytes.length - 4; i++) {
        if (bytes[i] === 73 && bytes[i + 1] === 66 && bytes[i + 2] === 71 && bytes[i + 3] === 49) {
          endIdx = i;
          break;
        }
      }

      const payloadBytes = bytes.slice(metaIdx, endIdx);
      const payload = new TextDecoder().decode(payloadBytes);
      return this.initFromPayload(payload);
    }

    loadFromJPG(bytes) {
      let offset = 0;
      while (offset < bytes.length - 4) {
        if (bytes[offset] === 0xFF && bytes[offset + 1] === 0xE1) {
          const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
          const payloadBytes = bytes.slice(offset + 4, offset + 2 + length);

          const magicIdx = this.findBytes(payloadBytes, new TextEncoder().encode(MAGIC));
          if (magicIdx !== -1) {
            const payload = new TextDecoder().decode(payloadBytes.slice(magicIdx + 4));
            return this.initFromPayload(payload);
          }
        }
        offset++;
      }

      return this.loadImageFallback(new Blob([bytes], { type: 'image/jpeg' }));
    }

    findBytes(haystack, needle) {
      outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
        for (let j = 0; j < needle.length; j++) {
          if (haystack[i + j] !== needle[j]) continue outer;
        }
        return i;
      }
      return -1;
    }

    async initFromPayload(payload) {
      try {
        const data = JSON.parse(decodeURIComponent(atob(payload)));
        this.payload = data;
        console.log('Interactive BG loaded, version:', data.v);
        return data;
      } catch (e) {
        console.error('Failed to decode payload:', e);
        return null;
      }
    }

    async loadImageFallback(blob) {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const ctx = this.canvas.getContext('2d');
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      return null;
    }

    start(config = {}) {
      if (this.engine) {
        this.engine.stop();
      }

      this.engine = new InteractiveEngine.Engine(this.canvas, {
        mode: config.mode || 'particles',
        interactive: config.interactive !== false
      });
      this.engine.start();

      return this.engine;
    }

    stop() {
      if (this.engine) {
        this.engine.stop();
      }
    }
  }

  return { Player };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractivePlayer;
}