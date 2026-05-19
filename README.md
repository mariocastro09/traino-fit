# Trainofit Landing Page

Welcome to **Trainofit**—the ultimate CrossFit landing page, modern and lightning fast. This project uses [React Router](https://reactrouter.com/) for navigation, [Tailwind CSS](https://tailwindcss.com/) for utility-first styling, and [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components. The landing page leans into a bold **yellow, white, and black** color scheme for maximum impact.

---

## Features

- 🏋️‍♀️ **Landing page** for Trainofit CrossFit box
- 🟡⚫⚪ **Color scheme:** yellow, white, and black
- 🎨 Preconfigured with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- ⚡ Hot Module Replacement (HMR) in dev
- ⚡ Asset bundling and optimization for production
- 💾 TypeScript support
- ⚙️ Server-side rendering ready
- ☁️ **Deploys easily to [Cloudflare Pages](https://pages.cloudflare.com/)**

---

## Getting Started

Clone the repo:

```bash
git clone https://github.com/your-org/trainofit-landing.git
cd trainofit-landing
```

Install dependencies:

```bash
npm install
```

### Development

Start the project locally for HMR:

```bash
npm run dev
```

View it at [http://localhost:5173](http://localhost:5173)

---

## Building for Production

```bash
npm run build
```

This generates the optimized output in `/build`.

---

## Deploying to Cloudflare Pages

1. Push your code to GitHub/GitLab.
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/) and create a new project connected to your repo.
3. Use the following build settings:

   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `build/client`
   - **Environment Variable:**
     - `NODE_VERSION = 20`
   - **Note:** If server-side functionality is needed, consider using [Cloudflare Functions](https://developers.cloudflare.com/pages/functions/).

4. Deploy!

Your Trainofit landing page will be live on your custom `.pages.dev` domain (or your own domain).

---

## Styling & UI

- **Primary Colors:**
  - Yellow: `#FFD600`
  - Black: `#111111`
  - White: `#FFFFFF`
- **Tailwind CSS** is fully set up with these colors in the config (`tailwind.config.js`).
- **shadcn/ui**: Run the init script to add new UI components on demand:

  ```bash
  npx shadcn-ui@latest init
  ```

  See [shadcn/ui documentation](https://ui.shadcn.com/docs) for usage and custom theming with your color palette.

---

## File Structure

```
├── package.json
├── tailwind.config.js
├── app/
│   ├── routes/
│   ├── components/
│   └── ...
├── build/
│   ├── client/    # Static assets for Cloudflare Pages
│   └── server/    # (If needed for SSR/Functions)
```

---

## Contributions

PRs are welcome! For improvements, dark mode, or new components, see the [issues](https://github.com/your-org/trainofit-landing/issues).

---

Built with 💛🖤🤍 using React Router, Tailwind CSS, and shadcn/ui for Trainofit.

