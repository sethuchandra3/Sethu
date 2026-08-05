# Sethu Chandra | Personal Portfolio

This is my personal corner of the internet: a place to show how I think, what I build, the communities I care about, and the sidequests that make life interesting.

The portfolio is designed to feel more like a guided story than a traditional resume. It moves from a simple introduction into what I have been doing lately, the experiences that shaped me, selected projects, community involvement, and a few moments from outside work. The tone is intentionally curious, candid, and a little playful.

## What is inside

- **A changing introduction:** Builder, storyteller, and learner are not separate identities here. They are different ways I approach the same work.
- **As of lately:** A quick look at the teams and communities currently taking up my time and attention.
- **Experience:** Work and community involvement presented as experiences rather than a static list of job titles.
- **Projects:** Concepts and shipped work that show how I think, design, experiment, and build.
- **Cool sidequests:** Travel, leadership, service, and the moments that pushed me outside my comfort zone.
- **My World:** An interactive gallery of places I have travelled to and called home.
- **Let's connect:** A moving collection of interests and ways to reach me.

## The vibe

The site combines a minimal editorial layout with expressive interaction. Large typography keeps the story direct, while scroll-driven transitions, curved text, tactile project previews, and the gallery dome add personality without turning the portfolio into a collection of disconnected effects.

Light and dark modes share the same visual language. Orange, deep pink, soft pink, and restrained neutral tones bring warmth to an otherwise minimal interface. Motion is used to guide attention and communicate progression, not simply as decoration.

The experience is also adapted for smaller screens and touch devices. Desktop-only cursor and WebGL interactions are removed where they would interfere with natural mobile navigation, and reduced-motion preferences are respected.

## Tech stack

- **Astro** for the site structure, routing, static output, and performance-focused foundation
- **React** for interactive sections and component state
- **GSAP and ScrollTrigger** for scroll-linked storytelling, pinned sequences, and transitions
- **Motion** for interface animation and responsive interaction
- **Three.js, React Three Fiber, and Drei** for the FluidGlass project lens and 3D rendering
- **OGL** for lightweight shader-based effects
- **Matter.js** for physics-driven experiments
- **CSS** for the responsive layout, theme system, typography, and most visual styling

## Project structure

```text
/
├── public/
│   └── assets/            # Project images, community logos, GIFs, and 3D assets
├── src/
│   ├── components/        # React components and their styles
│   ├── pages/             # Astro routes
│   └── styles/            # Shared global styling and design tokens
└── package.json
```

## Running locally

This project requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

The development site is available at `http://localhost:4321` by default.

## Available commands

| Command | Purpose |
| :-- | :-- |
| `npm run dev` | Start the local Astro development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro -- --help` | View the available Astro CLI commands |

## A note on the work

This portfolio is intentionally evolving. New projects, full case studies, photographs, and experiments will continue to be added as the work develops. The goal is not to present a finished version of me. It is to make the direction, curiosity, and care behind the work visible.
