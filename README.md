# Forma — Mockup Studio

A browser-based product mockup editor built with React, TypeScript, Vite, Tailwind CSS and Fabric.js. Upload a blank product photo, add your artwork and personalized text, and export a high-resolution PNG without accounts, a database, or server-side file processing. The interface is in Brazilian Portuguese; source identifiers and documentation are in English.

## The problem

Small creators need a fast way to visualize custom merchandise before production. Forma offers a focused workspace for positioning artwork over product photography, blending it with existing highlights and shadows, and preparing presentation images.

## Features

- Local image upload with type validation, a 25 MB limit and helpful failure messages.
- Fixed product background with preserved aspect ratio, centered within a 1000 × 1000 canvas.
- Multiple artwork layers with interactive dragging, scaling and rotation.
- Editable text, fonts, font size and color. Double-click canvas text to edit it directly.
- Opacity, Normal / Multiply / Overlay blending, rotation and centering.
- Layer selection, visibility, ordering, duplication and deletion.
- Undo / redo with a bounded 30-state in-memory history.
- Workspace zoom and 1×, 2× or 3× PNG export (up to 3000 × 3000 pixels).
- Responsive UI with accessible form labels and keyboard focus indicators.
- Editable, original SVG demo product; no external asset requests.

## Stack

| Concern | Technology |
| --- | --- |
| UI | React 19 |
| Language | TypeScript with strict checking |
| Tooling | Vite 6 |
| Styling | Tailwind CSS 4 plus scoped semantic CSS classes |
| Canvas | Fabric.js 6 |
| Icons | Lucide React |
| Storage | In-memory browser state only |

## Architecture

```text
forma-mockup/
├── .github/workflows/
│   └── deploy.yml                # PR validation and Pages deployment
├── src/
│   ├── components/
│   │   ├── Topbar.tsx            # History and export actions
│   │   ├── Sidebar.tsx           # Local upload, text and layer tools
│   │   ├── CanvasWorkspace.tsx   # Editing surface and workspace zoom
│   │   └── PropertiesPanel.tsx   # Selected-object inspector
│   ├── hooks/
│   │   └── useEditor.ts          # Canvas lifecycle, commands and state
│   ├── tote.svg                  # Bundled demo asset, safe under subpaths
│   ├── vite-env.d.ts             # Vite asset typings
│   ├── main.tsx                  # Composition root
│   └── styles.css                # Design tokens and responsive layout
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Run locally

Prerequisites: Node.js 22 LTS or later and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. No API keys, environment variables, database migrations or backend services are required.

For a deterministic installation from the lockfile:

```bash
npm ci
```

## Production

```bash
npm run build
npm run preview
```

The build checks TypeScript before generating the static `dist/` output. Deploy that directory to any static host. No server runtime is necessary.

## Workflow

1. Upload a product photo using **Enviar foto do produto**, or drop an image onto its upload area.
2. Upload a transparent PNG using **Adicionar sua arte**.
3. Select the artwork, drag it, scale it using the corner handles, and rotate it using the rotation handle.
4. Use **Ajustes da camada** to adjust opacity or apply Multiply / Overlay.
5. Add personalized text. Double-click it to edit inline, or use the inspector.
6. Open **Camadas** to toggle visibility and select layers. Use the inspector to reorder, duplicate or remove objects.
7. Select the export resolution in the top bar and click **Exportar PNG**.

## Engineering practices

- **Single responsibility:** distinct upload controls, workspace, inspector and export toolbar.
- **Custom hook as an application boundary:** `useEditor` owns Fabric's mutable scene graph and exposes typed commands; views consume this contract.
- **Strict TypeScript:** explicit object and editor types, typed refs and native Fabric classes; no `any` in application source.
- **Composition over inheritance:** presentation components are assembled by a small application root.
- **Resource ownership:** canvas is disposed on unmount; temporary upload object URLs are revoked after decoding.
- **Explicit state transitions:** all canvas edits synchronize layer state and record undo history; restoring history avoids recursive saves.
- **Privacy by design:** image uploads are decoded locally; there is no upload endpoint or database.
- **Production reproducibility:** committed npm lockfile and a build that includes static type checking.
- **Accessible controls:** semantic buttons, input labels, accessible names, focus indicators and Portuguese page language.

## Practical limits

State is temporary: refreshing or closing the page clears the session. Export the PNG before leaving. Workspace zoom does not affect export resolution. Larger exports cannot restore detail missing from a small source image. The product background is fitted with containment; non-square images can have margins. Fabric's standard controls provide 2D transforms, not perspective warping, cylindrical wrapping or displacement mapping. Blend modes approximate surface lighting; this is not a photorealistic 3D renderer. SVG imports use Fabric/browser support and complex SVG effects may vary; PNG, JPEG and WebP are the recommended inputs.

## Validation

`npm run build` validates strict types and the production bundle. Manual acceptance checks should cover local background/art uploads, invalid input, object transforms, text editing, blend changes, layer visibility/order, undo/redo, and PNG dimensions at each export scale.

## Author

Created as a technical portfolio project for Cassiano Nishikawa — [GitHub](https://github.com/caxiano).

## GitHub Pages deployment

1. Create a public repository named `forma-mockup-studio` under your GitHub account.
2. Push the contents of this directory to its `main` branch. Include the hidden `.github` directory.
3. Open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. Open **Actions → Validate and deploy to GitHub Pages → Run workflow** if the initial push occurred before Pages was enabled.
5. Follow the successful deployment job's URL. Future pushes to `main` build and deploy automatically; pull requests build without deploying.

The workflow uses official GitHub actions pinned to commit SHAs, an npm lockfile, Node.js 22, a separate deployment job and minimal job permissions. No personal access token or repository secret is required. The relative Vite base and bundled product illustration support repository subpaths and custom domains.

### Publish from a local terminal

With Git and GitHub CLI installed, sign in with `gh auth login`, then run from the extracted source directory:

```bash
git init -b main
git add .
git commit -m "feat: launch Forma mockup studio"
gh repo create forma-mockup-studio --public --source=. --remote=origin --push
gh api --method POST repos/caxiano/forma-mockup-studio/pages -f build_type=workflow
gh workflow run deploy.yml
```

If the repository already exists, configure its remote and push instead of running `gh repo create`. The CLI instructions assume the `caxiano` account.

Deployment reference: [Vite static deployment guide](https://vite.dev/guide/static-deploy).
