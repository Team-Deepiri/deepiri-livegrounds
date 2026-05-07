const InteractiveEncoder = (() => {
  const MAGIC = 'IBG1';
  const VERSION = '1.0';

  function encodePayload(engineCode, config) {
    const payload = {
      v: VERSION,
      c: config,
      e: engineCode
    };
    return btoa(encodeURIComponent(JSON.stringify(payload)));
  }

  function decodePayload(encoded) {
    try {
      return JSON.parse(decodeURIComponent(atob(encoded)));
    } catch (e) {
      return null;
    }
  }

  async function encodePNG(canvas, engineCode, config) {
    const payload = encodePayload(engineCode, config);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const encoder = new TextEncoder();
    const magicBytes = encoder.encode(MAGIC);
    const lengthBytes = new Uint8Array([0, 0, 0, payload.length]);
    const payloadBytes = encoder.encode(payload);
    const crcData = new Uint8Array(magicBytes.length + lengthBytes.length + payloadBytes.length);

    let crc = 0xFFFFFFFF;
    for (let i = 0; i < crcData.length; i++) {
      if (i < magicBytes.length) crcData[i] = magicBytes[i];
      else if (i < magicBytes.length + lengthBytes.length) crcData[i] = lengthBytes[i - magicBytes.length];
      else crcData[i] = payloadBytes[i - magicBytes.length - lengthBytes.length];
    }

    const crc32Table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crc32Table[n] = c;
    }
    for (let i = 0; i < crcData.length; i++) {
      crc = crc32Table[(crc ^ crcData[i]) & 0xFF] ^ (crc >>> 8);
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;

    const crcBytes = new Uint8Array([
      (crc >> 24) & 0xFF,
      (crc >> 16) & 0xFF,
      (crc >> 8) & 0xFF,
      crc & 0xFF
    ]);

    const chunk = new Uint8Array(4 + 4 + magicBytes.length + lengthBytes.length + payloadBytes.length + 4);
    let offset = 0;
    chunk.set(lengthBytes, offset); offset += 4;
    chunk.set(magicBytes, offset); offset += 4;
    chunk.set(payloadBytes, offset); offset += payloadBytes.length;
    chunk.set(crcBytes, offset);

    const result = new Uint8Array(bytes.length + chunk.length);
    result.set(bytes, 0);
    result.set(chunk, bytes.length);

    return new Blob([result], { type: 'image/png' });
  }

  function encodeSVG(canvas, engineCode, config) {
    const dataUrl = canvas.toDataURL('image/png');
    const payload = encodePayload(engineCode, config);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" data-interactive="${payload}">
  <image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>
  <script type="text/javascript"><![CDATA[
    (function() {
      var payload = "${payload}";
      try {
        var data = JSON.parse(decodeURIComponent(atob(payload)));
        console.log('Interactive BG loaded, version:', data.v);
        window.__interactiveBG = data;
        window.dispatchEvent(new CustomEvent('interactiveBGLoaded', { detail: data }));
      } catch(e) { console.error('IBG: Decode error', e); }
    })();
  ]]></script>
</svg>`;
  }

  function encodeWebP(canvas, engineCode, config) {
    return new Promise(resolve => {
      const payload = encodePayload(engineCode, config);
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = e => {
          const bytes = new Uint8Array(e.target.result);
          const payloadBytes = new TextEncoder().encode(payload);
          const result = new Uint8Array(bytes.length + payloadBytes.length + 4);
          result.set(bytes, 0);
          result.set(payloadBytes, bytes.length);
          result.set(new Uint8Array([77, 69, 84, 65]), bytes.length + payloadBytes.length);
          resolve(new Blob([result], { type: 'image/webp' }));
        };
        reader.readAsArrayBuffer(blob);
      }, 'image/webp');
    });
  }

  function encodeBMP(canvas, engineCode, config) {
    return new Promise(resolve => {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const rowSize = Math.ceil((canvas.width * 3) / 4) * 4;
      const pixelDataSize = rowSize * canvas.height;
      const fileSize = 54 + pixelDataSize;

      const buffer = new ArrayBuffer(fileSize);
      const view = new DataView(buffer);

      view.setUint8(0, 0x42);
      view.setUint8(1, 0x4D);
      view.setUint32(2, fileSize, true);
      view.setUint32(10, 54, true);
      view.setUint32(14, 40, true);
      view.setInt32(18, canvas.width, true);
      view.setInt32(22, -canvas.height, true);
      view.setUint16(26, 1, true);
      view.setUint16(28, 24, true);
      view.setUint32(30, pixelDataSize, true);

      const payload = encodePayload(engineCode, config);
      const payloadBytes = new TextEncoder().encode(payload);
      const payloadOffset = 54 + pixelDataSize;

      for (let i = 0; i < payloadBytes.length && (payloadOffset + i) < fileSize + payloadBytes.length; i++) {
        view.setUint8(payloadOffset + i, payloadBytes[i]);
      }

      view.setUint8(payloadOffset + payloadBytes.length, 0x49);
      view.setUint8(payloadOffset + payloadBytes.length + 1, 0x42);
      view.setUint8(payloadOffset + payloadBytes.length + 2, 0x47);
      view.setUint8(payloadOffset + payloadBytes.length + 3, 0x31);

      let offset = 54;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          view.setUint8(offset++, data[i + 2]);
          view.setUint8(offset++, data[i + 1]);
          view.setUint8(offset++, data[i]);
        }
        while (offset % 4 !== 54 % 4 && offset < 54 + pixelDataSize) offset++;
      }

      resolve(new Blob([buffer], { type: 'image/bmp' }));
    });
  }

  function encodeJPG(canvas, engineCode, config) {
    return new Promise(resolve => {
      const payload = encodePayload(engineCode, config);
      const payloadEncoded = 'IBG1' + payload;

      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);

        tempCanvas.toBlob(blob => {
          const reader = new FileReader();
          reader.onload = e => {
            const bytes = new Uint8Array(e.target.result);
            const payloadBytes = new TextEncoder().encode(payloadEncoded);

            const markerStart = findNextMarker(bytes, 0xFF);
            if (markerStart > 0) {
              const result = new Uint8Array(bytes.length + payloadBytes.length + 2);
              result.set(bytes.slice(0, markerStart), 0);
              result.set(new Uint8Array([0xFF, 0xE1]), markerStart);
              const len = payloadBytes.length + 2;
              result.set(new Uint8Array([(len >> 8) & 0xFF, len & 0xFF]), markerStart + 2);
              result.set(payloadBytes, markerStart + 4);
              result.set(bytes.slice(markerStart + 2), markerStart + 4 + payloadBytes.length);
              resolve(new Blob([result], { type: 'image/jpeg' }));
            } else {
              resolve(blob);
            }
          };
          reader.readAsArrayBuffer(blob);
        }, 'image/jpeg', 0.9);
      };
      img.src = canvas.toDataURL('image/jpeg', 0.9);
    });
  }

  function findNextMarker(bytes, marker) {
    for (let i = 0; i < bytes.length - 1; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === marker) {
        return i;
      }
    }
    return -1;
  }

  return {
    encodePNG,
    encodeSVG,
    encodeWebP,
    encodeBMP,
    encodeJPG,
    encodePayload,
    decodePayload,
    MAGIC
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractiveEncoder;
}