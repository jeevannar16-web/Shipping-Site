<div align="center">

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/favicon.svg">
    <img src="./public/favicon.svg" alt="Jeevan Global Logistics logo" width="80" />
  </picture>

  # Jeevan Global Logistics

  ### Global Freight Forwarding & Logistics — Award-Winning Interactive 3D Website

  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
  [![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://gsap.com/)

  A high-end, Awwwards-style corporate website for **Jeevan Global Logistics** — a global freight
  forwarder and logistics provider. Built with a cinematic motion system, an interactive
  WebGL 3D globe, and a fully responsive dark industrial design.

  **Live site:** [shipping-site-jeevan.vercel.app](https://shipping-site-jeevan.vercel.app)

</div>

---

## ✨ Features

### 🌐 Interactive 3D Globe (React Three Fiber)
- Realistic dark earth texture with **glowing lat/long wireframe grid**
- **Fresnel atmospheric rim lighting** for a cinematic edge glow
- **9 operating-country hub markers** (Australia, NZ, Hong Kong, China, Vietnam, US, Thailand, Germany, UK) with pulse rings and hover tooltips
- **Flying route particles** travelling along luminous arc connections
- **Mouse-damped camera** that follows the pointer with lerp easing
- **Starfield background**, drag-to-orbit controls
- Graceful **WebGL fallback** + error boundary for unsupported devices

### 🎬 Cinematic Motion System
- **Lenis** inertia smooth scrolling
- **GSAP + ScrollTrigger** choreography: headline line-masking, parallax reveals, staggered card entrances
- **Magnetic buttons** with press-scale feedback
- **Custom glowing cursor ring** that expands over interactive elements
- **`prefers-reduced-motion`** support — heavy WebGL & scroll animation disabled for accessibility

### 🧭 Navigation & Layout
- Fixed glassmorphic navbar with scroll-aware background
- **Full-screen overlay menu** with staggered typography links and **live UTC clocks** (Melbourne, Hong Kong, London, Los Angeles)
- Scroll-anchored section links with Lenis easing

### 📦 Feature-Rich Sections
| Section | Highlights |
| --- | --- |
| **Hero** | "Every leg of the journey" headline, animated line-mask, dual magnetic CTAs, 3D globe |
| **About** | Real company stats with scroll-triggered **count-up animation** (2,500+ shipments/mo, 98.2% on-time) |
| **Services** | Air, Ocean, Customs, Warehousing & 3PL, Project Cargo, Domestic & Linehaul + marquee ticker |
| **Reliability** | Real-time tracking, global coverage, 24/7 support cards |
| **Why Us** | One point of contact, full visibility, compliance, transparent pricing |
| **Global Network** | Tabbed **regional hub selector** with live local time + capabilities per country |
| **Digital Tools** | Working **shipment tracking simulator** + **instant freight quote estimator** |
| **Insights** | Filterable grid with **animated layout transitions** |
| **FAQ** | Smooth height-animated accordion with glowing indicators |
| **Contact / Footer** | Quote form, regional details, QHSE/ISO certification badges |

### ⚡ Live 3D Logistics Objects
- Stylized low-poly **cargo plane** and **container ship** floating into view over feature sections with scroll parallax

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open http://localhost:5173
```

### Production build

```bash
npm run build   # type-check (tsc) + production bundle
npm run preview # serve the built site locally
```

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | React 19 + Vite 8 (TypeScript) |
| **Styling** | Tailwind CSS v4 (dark design system, orange accent) |
| **3D / WebGL** | Three.js + React Three Fiber + Drei |
| **Animation** | GSAP (ScrollTrigger) + Lenis smooth scroll |
| **Icons** | Lucide React |
| **Typography** | Archivo + IBM Plex Mono (Google Fonts) |

### Design tokens

- Background — `#0a0a0a` (void), `#14181F` (industrial night), `#FAF9F7` (paper)
- Accent — `#ff4a00` (orange), teal `#2E9CC9`
- Headlines — Archivo · Body — IBM Plex Mono

---

## 📁 Project Structure

```
src/
├── components/
│   ├── chrome/           # Header, Footer, NewsTicker, PageTransition, Preloader
│   ├── CursorManager.tsx # Custom glowing cursor ring
│   ├── ErrorBoundary.tsx # WebGL crash fallback
│   ├── Models.tsx        # Shared 3D model loading
│   ├── SceneCanvas.tsx   # <Canvas> wrapper (dpr, fallback poster, mobile gating)
│   └── SceneStage.tsx    # Per-section scene mount (camera rig + global lights)
├── dev/
│   └── VisualTest.tsx    # DEV-only framing overlay
├── hooks/
│   ├── useCountUp.ts     # Scroll-triggered number counter
│   ├── useLerpDamped.ts  # Damped value lerp for camera
│   └── useReducedMotion.ts # prefers-reduced-motion detection
├── lib/
│   ├── lenis.tsx         # Lenis smooth-scroll provider
│   ├── media.ts          # Shared useMedia / useCompact hooks
│   ├── motion.tsx        # GSAP motion primitives (LineMask, FadeUp, Counter…)
│   ├── nav.ts            # Navigation link data
│   ├── navigation.ts     # Transition-aware routing
│   └── scrub.ts          # ScrollTrigger scrub ref contract
├── pages/
│   ├── About.tsx / Contact.tsx / Home.tsx / Industries.tsx / Insights.tsx / Services.tsx
├── scenes/
│   ├── StackerScene.tsx  # Terminal: reach-stacker lift/arc/place + cinematic atmosphere
│   ├── TruckScene.tsx    # Linehaul: dual-truck corridor
│   ├── ViaductScene.tsx  # Highway: instanced traffic on an elevated viaduct
│   ├── ShipScene.tsx     # Ocean section
│   ├── GlobeScene.tsx    # Interactive 3D globe (hero)
│   ├── TerminalScene.tsx / ForestRoadScene.tsx
│   └── builders.tsx      # Shared asphalt/dash textures, trucks, RoadStrip, CurvedRoad
├── App.tsx               # Routing + providers
├── data.ts               # All site content (editable site content)
├── index.css             # Tailwind v4 theme + design tokens
└── main.tsx
```

---

## 🌍 Deployment

Deployed on **Vercel** — auto-rebuilds from `main` on every push.

| Platform | Status |
| --- | --- |
| Vercel | ✅ Live at [shipping-site-jeevan.vercel.app](https://shipping-site-jeevan.vercel.app) |
| Netlify | Config included (`netlify.toml`) — connect repo to deploy |

Both configs are included (`vercel.json`, `netlify.toml`) with build command `npm run build` and SPA rewrites.

---

## ♿ Accessibility

- Semantic landmarks and `aria` attributes on interactive regions
- Keyboard navigation (menu closes on `Escape`, `tabIndex` management)
- `prefers-reduced-motion` disables heavy WebGL & scroll animations
- `aria-hidden` on decorative canvases

---

## 🧑‍💻 Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server (HMR) |
| `npm run build` | Type-check with `tsc` then production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

---

## 📄 License

© 2026 Jeevan Global Logistics. All rights reserved.
