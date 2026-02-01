# NEXTLOOK - eCommerce Platform

**Următorul Tău Stil**

Site eCommerce modern pentru haine și încălțăminte branded la prețuri accesibile. 100% original, livrare rapidă, retur gratuit.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Stripe
- **Deployment:** Vercel + Supabase Cloud

## Quick Start

### 1. Install Dependencies

```bash
cd nextlook-ecommerce
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### 3. Setup Supabase Database

Run the SQL schema in your Supabase SQL editor (see `supabase-schema.sql` below).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nextlook-ecommerce/
├── app/                    # Next.js App Router pages
│   ├── (shop)/            # Shop pages layout group
│   │   ├── shop/          # Products listing
│   │   ├── product/       # Product details
│   │   ├── cart/          # Shopping cart
│   │   └── checkout/      # Checkout flow
│   ├── (account)/         # Account pages layout group
│   ├── (admin)/           # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── sections/          # Homepage sections
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities & configs
│   └── supabase/         # Supabase clients
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── styles/               # Global styles
```

## Features

### Customer Features
- Product browsing with filters & sorting
- Product details with image gallery
- Shopping cart with persistent storage
- Guest & authenticated checkout
- Order confirmation & tracking
- User account management
- Wishlist (coming soon)

### Admin Features
- Product CRUD operations
- Order management
- Customer overview
- Analytics dashboard (coming soon)

## Design System

### Colors
- **Primary:** Cream backgrounds (#FAF8F5, #F5EFE7, #E8DCC8)
- **Accent:** Gold (#D4AF37, #F4E5C3, #B8941F)
- **Secondary:** Olive (#6B7B5E), Warm Brown (#8B7355)
- **Text:** Dark (#2D2D2D), Secondary (#9A9590)

### Typography
- **Display:** Bebas Neue
- **Body:** Montserrat

## Supabase Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  sizes JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  images JSONB NOT NULL DEFAULT '[]',
  stock INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  styling_suggestions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_county TEXT NOT NULL,
  shipping_postal_code TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  delivery_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Order Items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  size TEXT,
  color TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- Cart Items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id, size, color)
);

-- Newsletter table
CREATE TABLE newsletter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security Policies

-- Products: Public read
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read products" ON products FOR SELECT USING (true);

-- Users: Users can read/update own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Addresses: Users can manage own addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own addresses" ON addresses USING (auth.uid() = user_id);

-- Orders: Users can read own orders, anyone can insert (guest checkout)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

-- Order Items: Anyone can insert
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);

-- Reviews: Public read, users can write own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can write own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cart: Users can manage own cart
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart" ON cart_items USING (auth.uid() = user_id);

-- Newsletter: Anyone can subscribe
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON newsletter FOR INSERT WITH CHECK (true);
```

## Stripe Webhooks

Set up a webhook endpoint in Stripe Dashboard:
- Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
- Events to listen: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to update:
- `NEXT_PUBLIC_SITE_URL` to your production domain
- Use Stripe live keys instead of test keys

## License

MIT

---

Built with ❤️ for NEXTLOOK
