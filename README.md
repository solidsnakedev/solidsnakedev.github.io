# SolidSnakeDev Portfolio

Retro cyberpunk terminal-themed portfolio built with Astro, React, and Tailwind CSS.

## 🎨 Features

- Amber/orange terminal aesthetic with CRT scanline effects
- Glitch effects on hover
- Pixel art styling
- VT323 monospace font
- Blog with Markdown support
- Static site generation
- GitHub Pages deployment

## 🚀 Development

```sh
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```text
/
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages deployment
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── TerminalHeader.astro
│   │   └── TerminalPrompt.tsx
│   ├── content/
│   │   ├── blog/
│   │   │   └── midnight.md
│   │   └── config.ts
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── index.astro
│   │   ├── projects.astro
│   │   └── contact.astro
│   └── styles/
│       └── global.css
└── astro.config.mjs
```

## 🛠 Tech Stack

- **Framework**: Astro 5.16.7
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4.1.18
- **Deployment**: GitHub Pages
- **Package Manager**: pnpm

## 📦 Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### Setup GitHub Pages:
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to main branch - workflow will run automatically

## 🎯 Customization

- **Colors**: Edit CSS variables in `src/styles/global.css`
- **Content**: Add blog posts in `src/content/blog/` with frontmatter
- **Projects**: Update `src/pages/projects.astro`
- **Contact**: Modify `src/pages/contact.astro`

## 👀 Learn More

- [Astro Documentation](https://docs.astro.build)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
