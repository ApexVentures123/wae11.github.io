# WE ARE EMPOWER (WAE) - Launch Website

This is the official coming soon / launch website for **WE ARE EMPOWER (WAE)**. 
It features a high-performance interactive 3D globe built with Three.js, a countdown timer to launch, and a fully responsive glassmorphism UI.

## Features
- **Interactive 3D Globe:** Custom-lit 3D Earth model with high-resolution textures and cloud layers.
- **Optimized Performance:** Implements `THREE.LoadingManager` with a staggered entrance animation and bounds `devicePixelRatio` to prevent high-DPI mobile devices from crashing during render.
- **Responsive Design:** Fluid typography and layout that scales beautifully across mobile devices, tablets, and massive desktop screens.
- **Countdown Timer:** Live JavaScript countdown tracking the launch date.
- **Mobile Menu Overlay:** Custom-built overlay menu that avoids stacking context traps on mobile Safari/Chrome.

## Setup & Running Locally
To run this project locally, you must serve it via a local web server (to bypass browser CORS restrictions for loading 3D OBJ/Texture assets).

1. Open your terminal in this directory.
2. Run a local server. For example, using Python:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your web browser.

## Deployment (GitHub Pages)
This project is entirely static (HTML, CSS, JS, and 3D Assets) and is perfectly formatted to be hosted on **GitHub Pages**, Vercel, or Netlify.
To deploy on GitHub pages:
1. Push this code to a public or private GitHub repository.
2. Go to your repository **Settings** > **Pages**.
3. Select the `main` branch as the source and click **Save**.
4. Your site will be live within a few minutes!
