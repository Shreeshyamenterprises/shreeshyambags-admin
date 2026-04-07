# Shree Shyam Bags — Admin Panel

Next.js admin dashboard for the Shree Shyam Bags e-commerce platform. Manage products, variants, images, orders, and B2B quote requests.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| HTTP | Axios |
| Icons | Lucide React |

---

## Project Structure

```
nonwoven-admin/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Redirects to /dashboard
│   ├── layout.tsx                # Root layout with sidebar + auth guard
│   ├── login/page.tsx            # Admin login
│   ├── dashboard/page.tsx        # Stats overview
│   ├── products/
│   │   ├── page.tsx              # Product management table
│   │   ├── new/page.tsx          # Create new product
│   │   └── [id]/page.tsx         # Edit product, variants, images
│   ├── orders/page.tsx           # Orders management
│   └── quotes/page.tsx           # Quote requests management
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx           # Left navigation
│   │   └── header.tsx            # Page header
│   ├── auth/
│   │   └── admin-login-form.tsx  # Login form
│   ├── products/
│   │   ├── create-product-form.tsx
│   │   ├── add-variant-form.tsx
│   │   ├── update-variant-form.tsx
│   │   └── upload-product-image-form.tsx
│   └── ui/                       # Reusable UI components
│       ├── button.tsx
│       ├── toggle.tsx
│       ├── dropdown.tsx
│       ├── modal.tsx
│       ├── table.tsx
│       ├── badge.tsx
│       ├── toast.tsx
│       ├── skeleton.tsx
│       ├── confirm-dialog.tsx
│       └── empty-state.tsx
├── lib/
│   ├── api.ts                    # Axios instance
│   └── auth.ts                   # Admin token helpers
├── types/
│   └── index.ts                  # TypeScript type definitions
├── public/                       # Static assets
└── netlify.toml                  # Netlify deployment config
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Admin login (email + password, ADMIN role required) |
| `/dashboard` | Live stats: products, quotes, orders, low stock |
| `/products` | Product listing with search and filters |
| `/products/new` | Create a new product |
| `/products/[id]` | Edit product — manage variants, images, pricing tiers |
| `/orders` | View and manage all customer orders |
| `/quotes` | View and respond to B2B bulk quote requests |

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js 20+
- npm
- Backend API running (see [shreeshyambags-backend](https://github.com/Shreeshyamenterprises/shreeshyambags-backend))
- An admin account created via the backend `create-admin.mjs` script

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/Shreeshyamenterprises/shreeshyambags-admin.git
cd shreeshyambags-admin
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Set up environment variables

Create a `.env.local` file in the project root:

```env
# URL of the running backend API
NEXT_PUBLIC_API_URL=http://localhost:3000

# URL of the customer frontend (used in admin login page link)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
```

> For production, use your Render and Netlify URLs.

### Step 4 — Create an admin user (first time only)

The admin panel requires an account with `ADMIN` role. Run this on the backend:

```bash
# From the backend repo directory
node scripts/create-admin.mjs admin@yourdomain.com YourPassword123
```

### Step 5 — Start the development server

```bash
npm run dev
```

Admin panel will be running at `http://localhost:3002`

> Make sure the backend is also running at `http://localhost:3000`

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3002 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Authentication

- Login at `/login` using your admin email and password
- Token is stored in `localStorage` under the key `admin_token`
- All pages (except `/login`) are protected — unauthenticated users are redirected to `/login`
- Only users with `role: ADMIN` can access the panel (enforced on both frontend and backend)

---

## Dashboard Features

- **Stats**: Total products, active products, open quotes, total orders
- **Inventory**: Active variants, low stock alerts
- **Quick actions**: Create product, view quotes, manage orders

---

## Product Management

1. **Create product** — name, slug, description, base price, category
2. **Add variants** — size, color, shape, price per unit, price per kg, GSM, stock
3. **Pricing tiers** — bulk quantity slabs (min kg → price per kg)
4. **Upload images** — drag and drop, uploaded directly to Cloudinary
5. **Toggle active/inactive** — hide products without deleting
6. **Delete** — products, variants, images with confirmation

---

## Quote Management

B2B customers submit quote requests from the frontend. In the admin panel you can:
- View enquiry details (contact info, product, quantity kg, GSM, printing, logo)
- Filter by status: PENDING / REVIEWED / APPROVED / REJECTED
- Set price per kg and add admin notes
- Update quote status

---

## Deployment (Netlify — Free Tier)

### Step 1 — Push to GitHub
Make sure your code is pushed to the `main` branch.

### Step 2 — Create a site on Netlify
1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Connect GitHub → select `shreeshyambags-admin`

### Step 3 — Configure build settings

| Field | Value |
|-------|-------|
| Branch | `main` |
| Base directory | *(leave empty)* |
| Build command | `npm run build` |
| Publish directory | `.next` |

### Step 4 — Add environment variables

In Netlify → **Site configuration → Environment variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://shreeshyambags-backend.onrender.com` |
| `NEXT_PUBLIC_FRONTEND_URL` | `https://shreeshyambags.netlify.app` |

### Step 5 — Deploy
Click **Deploy site**. Admin panel will be live at `https://your-admin.netlify.app`

> After changing any environment variable on Netlify, always do **Trigger deploy → Clear cache and deploy** — Next.js bakes env vars at build time.

### Step 6 — Update backend CORS
In Render → your backend service → **Environment**, make sure:

| Key | Value |
|-----|-------|
| `ADMIN_URL` | `https://your-admin.netlify.app` |

Then redeploy the backend.

---

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production — deploys to Netlify automatically |
| `staging` | Staging — test here before merging to main |

### Recommended workflow
```bash
# Work on staging
git checkout staging
# make your changes
git add . && git commit -m "your change"
git push origin staging

# When ready for production
git checkout main
git merge staging
git push origin main
```
