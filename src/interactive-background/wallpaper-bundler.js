const WallpaperBundler = (() => {
  function createWindowsWallpaper(canvas, config, engineCode) {
    const wallpaper = {
      version: '1.0',
      type: 'deepiri-interactive',
      created: new Date().toISOString(),
      config: config,
      engine: engineCode,
      preview: canvas.toDataURL('image/png', 0.7)
    };

    const jsonStr = JSON.stringify(wallpaper);
    const jsonBytes = new TextEncoder().encode(jsonStr);
    const magic = new TextEncoder().encode('DWAL');
    const sizeBytes = new Uint8Array(4);
    const view = new DataView(sizeBytes.buffer);
    view.setUint32(0, jsonBytes.length, true);

    const header = new Uint8Array([...magic, ...sizeBytes]);
    const result = new Uint8Array(header.length + jsonBytes.length);
    result.set(header, 0);
    result.set(jsonBytes, header.length);

    return new Blob([result], { type: 'application/x-deepiri-wallpaper' });
  }

  function createWindowsTheme(_canvas, _config, _engineCode) {
    const themeContent = `[Theme]
DisplayName=Deepiri Interactive Wallpaper
[Slideshow]
Interval=0
Shuffle=0
[Desktop Wallpaper]
Item1Path=wallpaper.html
Item1Position=0

[Wallpaper]
HTMLWallpaper=wallpaper.html
`;

    return new Blob([themeContent], { type: 'text/x-windows-theme' });
  }

  function createZipBundle(canvas, config, engineCode) {
    const htmlContent = generateWallpaperHTML(config);
    const preview = canvas.toDataURL('image/png', 0.7);

    const manifest = {
      name: config.name || 'Deepiri Wallpaper',
      version: '1.0',
      type: 'interactive',
      config: config,
      preview: preview
    };

    return createManualZip([
      { name: 'manifest.json', content: JSON.stringify(manifest, null, 2), type: 'application/json' },
      { name: 'wallpaper.html', content: htmlContent, type: 'text/html' },
      { name: 'preview.png', content: preview.split(',')[1], type: 'image/png', base64: true },
      { name: 'engine.min.js', content: minifyEngine(engineCode), type: 'application/javascript' },
      { name: 'README.txt', content: getReadmeContent(config), type: 'text/plain' }
    ]);
  }

  function generateWallpaperHTML(config) {
    const c = config || {};
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deepiri Interactive Wallpaper</title>
  <style>
    * { margin: 0; padding: 0; }
    html, body { 
      width: 100%; height: 100%; overflow: hidden;
      background: ${c.bgColor || '#0d0d14'};
      cursor: none;
    }
    canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
  </style>
</head>
<body>
<canvas id="bg"></canvas>
<script>
${getEmbeddedEngine(c)}
</script>
</body>
</html>`;
  }

  function getEmbeddedEngine(config) {
    const c = config || {};
    return `const canvas=document.getElementById('bg'),ctx=canvas.getContext('2d');
const C={p:${c.particleCount||200},c:${JSON.stringify(c.colors||['#ff6b6b','#4ecdc4','#45b7d1','#96ceb4','#ffeaa7','#dfe6e9'])},b:'${c.bgColor||'#0d0d14'}',s:${c.speed||3},z:${c.particleSize||6}};
class P{constructor(){this.r()}r(x,y){this.x=x??Math.random()*w,this.y=y??Math.random()*h,this.vx=(Math.random()-.5)*C.s,this.vy=(Math.random()-.5)*C.s,this.size=Math.random()*C.z+C.z/2,this.color=C.c[Math.floor(Math.random()*C.c.length)],this.l=1,this.d=Math.random()*.008+.003}u(){this.x+=this.vx,this.y+=this.vy,this.l-=this.d,this.x<0||this.x>w||this.y<0||this.y>h||this.l<=0?this.r():0}d(){ctx.globalAlpha=this.l,ctx.fillStyle=this.color,ctx.beginPath(),ctx.arc(this.x,this.y,this.size*this.l,0,6.28),ctx.fill(),ctx.globalAlpha=1}}
let p=[],mx=0,my=0,w,h;function rz(){w=canvas.width=window.innerWidth,h=canvas.height=window.innerHeight}function init(){rz(),window.onresize=rz,window.onmousemove=e=>{mx=e.clientX,my=e.clientY},window.onclick=e=>{for(let i=0;i<30;i++){let t=new P();t.x=e.clientX,t.y=e.clientY,t.vx=(Math.random()-.5)*15,t.vy=(Math.random()-.5)*15,p.push(t)}p.length>C.p*2&&p.splice(0,30)};for(let i=0;i<C.p;i++)p.push(new P());loop()}function loop(){ctx.fillStyle=C.b,ctx.fillRect(0,0,w,h),ctx.strokeStyle='rgba(255,255,255,0.025)',ctx.lineWidth=1;for(let x=0;x<w;x+=50){ctx.beginPath(),ctx.moveTo(x,0),ctx.lineTo(x,h),ctx.stroke()}for(let y=0;y<h;y+=50){ctx.beginPath(),ctx.moveTo(0,y),ctx.lineTo(w,y),ctx.stroke()}let g=ctx.createRadialGradient(mx,my,0,mx,my,200);g.addColorStop(0,'rgba(78,205,196,0.1)'),g.addColorStop(1,'transparent'),ctx.fillStyle=g,ctx.fillRect(0,0,w,h);for(const q of p){let dx=q.x-mx,dy=q.y-my,d=Math.sqrt(dx*dx+dy*dy);d<100&&d>0&&(q.vx+=(dx/d)*((100-d)/100)*0.5,q.vy+=(dy/d)*((100-d)/100)*0.5),q.u(),q.d()}requestAnimationFrame(loop)}init();`;
  }

  function minifyEngine(code) {
    return code.replace(/\s+/g, ' ').replace(/; /g, ';').replace(/} /g, '}').replace(/ {/g, '{');
  }

  function getReadmeContent(_config) {
    return `DEEPIRI INTERACTIVE WALLPAPER
===============================
Created: ${new Date().toISOString().split('T')[0]}

HOW TO USE:
1. Extract all files from this archive
2. Open wallpaper.html in your browser
3. Set browser as your desktop wallpaper

INTERACTION:
- Move mouse to interact with particles
- Click to spawn particle bursts

Created with Deepiri Lyback
https://github.com/deepiri/lyback
`;
  }

  function createManualZip(files) {
    const encoder = new TextEncoder();
    const localEntries = [];
    const centralEntries = [];
    let localOffset = 0;

    for (const file of files) {
      let contentBytes;
      if (file.base64) {
        const binary = atob(file.content);
        contentBytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) contentBytes[i] = binary.charCodeAt(i);
      } else {
        contentBytes = encoder.encode(file.content);
      }

      const nameBytes = encoder.encode(file.name);
      const localHeader = buildLocalFileHeader(nameBytes, contentBytes.length);
      localEntries.push({ header: localHeader, data: contentBytes });
      centralEntries.push(buildCentralDirEntry(nameBytes, contentBytes.length, localOffset));
      localOffset += localHeader.length + contentBytes.length;
    }

    const eocd = buildEOCD(centralEntries.length, localOffset, localOffset);
    const totalSize = localEntries.reduce((s, e) => s + e.header.length + e.data.length, 0) +
      centralEntries.reduce((s, e) => s + e.length, 0) + eocd.length;
    const result = new Uint8Array(totalSize);
    let offset = 0;

    for (const entry of localEntries) {
      result.set(entry.header, offset); offset += entry.header.length;
      result.set(entry.data, offset); offset += entry.data.length;
    }

    const centralOffset = offset;
    for (const entry of centralEntries) {
      result.set(entry, offset); offset += entry.length;
    }

    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(12, centralEntries.length, true);
    eocdView.setUint32(16, centralEntries.length, true);
    eocdView.setUint32(20, centralOffset, true);
    eocdView.setUint32(24, offset - centralOffset, true);
    result.set(eocd, offset);

    return new Blob([result], { type: 'application/zip' });
  }

  function buildLocalFileHeader(nameBytes, dataSize) {
    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint16(18, 0, true);
    view.setUint32(22, dataSize, true);
    view.setUint32(26, dataSize, true);
    view.setUint16(30, 0, true);
    view.setUint16(28, nameBytes.length, true);
    header.set(nameBytes, 30);
    return header;
  }

  function buildCentralDirEntry(nameBytes, dataSize, localOffset) {
    const entry = new Uint8Array(46 + nameBytes.length);
    const view = new DataView(entry.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint16(18, 0, true);
    view.setUint16(24, 0, true);
    view.setUint32(20, 0, true);
    view.setUint16(28, nameBytes.length, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, dataSize, true);
    view.setUint32(38, dataSize, true);
    view.setUint16(44, 0, true);
    view.setUint32(42, localOffset, true);
    entry.set(nameBytes, 46);
    return entry;
  }

  function buildEOCD(numEntries, centralSize, centralOffset) {
    const eocd = new Uint8Array(22);
    const view = new DataView(eocd.buffer);
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, numEntries, true);
    view.setUint16(10, numEntries, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, centralOffset, true);
    view.setUint16(20, 0, true);
    return eocd;
  }

  function extractWindowsWallpaper(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const bytes = new Uint8Array(e.target.result);
        const magic = bytes.slice(0, 4);
        if (new TextDecoder().decode(magic) !== 'DWAL') {
          reject(new Error('Not a valid Deepiri wallpaper'));
          return;
        }
        const size = new DataView(bytes.buffer, 4, 4).getUint32(0, true);
        const jsonBytes = bytes.slice(8, 8 + size);
        const json = new TextDecoder().decode(jsonBytes);
        resolve(JSON.parse(json));
      };
      reader.readAsArrayBuffer(blob);
    });
  }

  function extractZipBundle(blob) {
    return extractWindowsWallpaper(blob);
  }

  return {
    createWindowsWallpaper,
    createWindowsTheme,
    createZipBundle,
    extractWindowsWallpaper,
    extractZipBundle,
    getEmbeddedEngine,
    generateWallpaperHTML
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WallpaperBundler;
}