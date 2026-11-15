# FORMA Design Engine

Reusable visual customization engine for your websites.

## Quick install

Add the stylesheet and core script before the closing `</body>` tag:

```html
<link rel="stylesheet" href="design-engine.css">
<script src="forma-core.js"></script>
<script>
  FORMA.init({ panel: true });
</script>
```

The settings button and drawer are generated automatically. Preferences are stored locally in the browser and isolated by hostname + pathname.

## API

```js
FORMA.init({
  panel: true,
  storageKey: 'my-storefront-design',
  target: document.body,
  defaultSettings: { palette: 'blue', mode: 'dark', radius: 18, glow: 20 },
  allowedControls: ['palette', 'mode', 'radius', 'glow', 'font', 'buttons', 'motion'],
  onChange(settings) { console.log('Design updated', settings); }
});

FORMA.getSettings();
FORMA.setSettings({ palette: 'emerald', radius: 24 });
FORMA.reset();
FORMA.destroy();
```

### Available controls
`palette`, `mode`, `radius`, `glow`, `font`, `buttons`, `motion`.

### Notes
- No framework or build step required.
- Uses localStorage only; no account or server required.
- Set a unique `storageKey` per project when you need a stable custom key.
- `target` may be a CSS selector or a DOM element; it controls where the floating settings button is mounted.
- Existing site styles remain yours. FORMA writes design tokens to `:root` and adds opt-in classes to `body`.
