# FORMA Design Engine 2.0

Portable visual customization layer for independent websites. No framework, build step, account, or server required.

## Install

Copy `forma-core.js` and `forma-core.css` into your project and include:

```html
<link rel="stylesheet" href="./forma-core.css">
<script src="./forma-core.js"></script>
<script>
  FORMA.init({
    panel: true,
    storageKey: "my-project-design",
    defaultSettings: { palette: "violet", mode: "dark", radius: 18 },
    onChange(settings) { console.log("Design changed", settings); }
  });
</script>
```

If `storageKey` is omitted, settings are isolated by hostname + pathname.

## API

- `FORMA.init(options)` — initialize engine and optional generated settings drawer.
- `FORMA.getSettings()` — return a copy of current settings.
- `FORMA.setSettings(partial)` — update settings, persist, and emit `forma:change`.
- `FORMA.reset()` — restore defaults.
- `FORMA.destroy()` — remove injected UI and style layer.

## Options

- `panel` (default true): create the floating settings button and drawer.
- `storageKey`: custom localStorage key.
- `target`: element or selector to mount the floating trigger.
- `defaultSettings`: override initial values.
- `onChange(settings)`: callback after changes.

## Design tokens

`--forma-accent`, `--forma-accent-2`, `--forma-radius`, `--forma-content-width`, `--forma-section-space`, `--forma-glow`, `--forma-bg`, `--forma-surface`, `--forma-text`.

Opt-in helpers: `.forma-container`, `.forma-section`, `.forma-card`, `.forma-gradient`.

## Demo

Open [engine-test.html](./engine-test.html) to see the engine running on a page that has no FORMA Playground markup.
