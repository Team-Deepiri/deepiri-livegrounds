# Deepiri Lyback


## What is this?

Deepiri Lyback lets you create and use interactive backgrounds that:
- Embed a mini-game/interactive experience directly into image files (PNG, SVG, WebP, BMP, JPG)
- Run as standalone HTML wallpapers on your desktop
- Work in browsers without heavy GPU usage

## Quick Start

### Use the Studio (Browser)

1. Open `tools/wallpaper-studio/studio.html` in your browser
2. Customize your background (particles, colors, effects)
3. Export as PNG/SVG/WebP or as an HTML wallpaper
4. Use the exported file or open HTML wallpaper directly

### Use as Desktop Wallpaper

1. Generate an HTML wallpaper from the studio
2. Open the HTML file in a browser
3. Set that browser window as your background, or use a wallpaper app that supports HTML

**Windows:** Use "HTML5 Desktop Wallpaper" or similar apps  
**Linux:** Use "Wallpaper Engine" equivalent or set browser as startup app  
**macOS:** Set browser with fullscreen HTML as login item

## Project Structure

```
deepiri-lyback/
├── src/interactive-background/
│   ├── core-engine.js    # Lightweight particle engine
│   ├── encoder.js        # Embeds game into image formats
│   └── player.js         # Decodes & plays embedded backgrounds
│
├── tools/wallpaper-studio/
│   ├── studio.html       # Create & export backgrounds
│   ├── export-wallpaper.js
│   └── player-demo.html  # Test exported files
│
└── assets/wallpapers/
    └── wallpaper-host.html
```

## Features

- **Interactive particles** - Mouse movement affects particles
- **Click to spawn** - Click anywhere to create particle bursts
- **Multiple export formats** - PNG, SVG, WebP, BMP, JPG, HTML
- **Lightweight** - Runs at 30fps on 2D canvas, no GPU heavy rendering
- **Self-contained** - Engine code embedded in exported files

## How It Works

1. **Encoder** packs the JavaScript engine + your config into the image file
2. **Player** extracts and runs the embedded code when you open the image
3. **Engine** renders interactive particles on canvas

## Tech Stack

- Pure JavaScript (no frameworks)
- HTML5 Canvas for rendering
- Standard image formats with embedded payload

## License

MIT License - see LICENSE file
