# FORMA Design Engine 3.0

Portable, framework-free design customization engine.

## Install

Copy `forma-core.js` and `forma-core.css` into your project:

```html
<link rel="stylesheet" href="./forma-core.css">
<script src="./forma-core.js"></script>
<script>
  FORMA.init({
    panel: true,
    storageKey: "my-project-design",
    defaultSettings: { mode: "dark", radius: 18 },
    onChange(settings) { console.log(settings); }
  });
</script>
```

## API

- `FORMA.init(options)` — initialize engine and generated design panel.
- `FORMA.getSettings()` — get a copy of current settings.
- `FORMA.setSettings(partial)` — update, persist and broadcast settings.
- `FORMA.reset()` — restore defaults.
- `FORMA.destroy()` — remove injected panel and style layer.

Options: `panel` (default true), `storageKey`, `target`, `defaultSettings`, `onChange`.
Without a custom key, preferences are isolated by hostname and pathname.

## FORMA 3.0 studios (core) (core)

- **Component Studio:** card recipes (glass/solid/outline/flat), button recipes (gradient/solid/outline/ghost), input and navigation styles.
- **Layout Builder:** content width, section spacing, grid columns and grid gap.
- **Background Studio:** aurora, minimal and grid backgrounds with intensity control.
- **Animation Timeline:** smooth/snappy/off motion and transition duration.
- **Theme Marketplace:** save named local themes, load them, delete them.
- **Theme portability:** JSON import/export.

## HTML helper classes

`.forma-container`, `.forma-section`, `.forma-grid`, `.forma-card`, `.forma-gradient`.

## Demo

Open [engine-test.html](./engine-test.html). It intentionally contains no Playground-specific markup.


## FORMA Studio 4.1

Load `forma-studio.js` after your page scripts to enable the compact tabbed visual studio. On the main Playground, open it with the **Редактор** button in the top bar.

- **Элементы:** select page elements and edit text, text color, background and radius.
- **Секции:** add Hero, Benefits, Pricing, FAQ, Reviews and Contact blocks.
- **Адаптив:** inspect the page in a separate desktop/tablet/mobile preview.
- **CSS:** apply custom CSS live.
- **Undo / Redo:** reverse editor changes without rebuilding the page DOM or breaking existing Playground interactions.
- **Экспорт:** move FORMA settings and custom CSS as a JSON file.
