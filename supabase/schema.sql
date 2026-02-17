-- NEXTLOOK E-commerce Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  category_id UUID REFERENCES categories(id),
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  sizes TEXT[], -- Array of available sizes
  colors TEXT[], -- Array of available colors
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  county VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  size VARCHAR(50),
  color VARCHAR(50),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  author_name VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Products and categories are public read
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Addresses policies
CREATE POLICY "Users can view their own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Wishlists policies
CREATE POLICY "Users can view their own wishlist" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" ON wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- Newsletter policies
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
  ('Tricouri', 'tricouri', 'Tricouri pentru barbati si femei'),
  ('Bluze', 'bluze', 'Bluze si camasi elegante'),
  ('Pantaloni', 'pantaloni', 'Pantaloni casual si eleganti'),
  ('Rochii', 'rochii', 'Rochii pentru toate ocaziile'),
  ('Incaltaminte', 'incaltaminte', 'Pantofi, adidasi si sandale'),
  ('Accesorii', 'accesorii', 'Genti, curele si bijuterii')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, description, price, original_price, category_id, brand, is_featured, is_new, sizes, colors, images) VALUES
  (
    'Tricou Premium Cotton',
    'tricou-premium-cotton',
    'Tricou din bumbac 100% organic, croiala regular fit. Perfect pentru zilele calduroase.',
    149.00,
    199.00,
    (SELECT id FROM categories WHERE slug = 'tricouri'),
    'Tommy Hilfiger',
    true,
    true,
    ARRAY['XS', 'S', 'M', 'L', 'XL'],
    ARRAY['Alb', 'Negru', 'Navy'],
    ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800']
  ),
  (
    'Bluza Eleganta Satin',
    'bluza-eleganta-satin',
    'Bluza din satin de inalta calitate, perfecta pentru birou sau ocazii speciale.',
    299.00,
    NULL,
    (SELECT id FROM categories WHERE slug = 'bluze'),
    'Hugo Boss',
    true,
    false,
    ARRAY['XS', 'S', 'M', 'L'],
    ARRAY['Ivory', 'Negru', 'Burgundy'],
    ARRAY['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800']
  ),
  (
    'Pantaloni Chino Slim',
    'pantaloni-chino-slim',
    'Pantaloni chino cu croiala slim, din bumbac stretch pentru confort maxim.',
    249.00,
    299.00,
    (SELECT id FROM categories WHERE slug = 'pantaloni'),
    'Calvin Klein',
    true,
    true,
    ARRAY['28', '30', '32', '34', '36'],
    ARRAY['Bej', 'Navy', 'Gri'],
    ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800']
  ),
  (
    'Rochie Midi Floral',
    'rochie-midi-floral',
    'Rochie midi cu print floral, perfecta pentru vara. Material fluid si confortabil.',
    399.00,
    NULL,
    (SELECT id FROM categories WHERE slug = 'rochii'),
    'Ralph Lauren',
    true,
    false,
    ARRAY['XS', 'S', 'M', 'L'],
    ARRAY['Floral Alb', 'Floral Albastru'],
    ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800']
  ),
  (
    'Sneakers Urban White',
    'sneakers-urban-white',
    'Sneakers din piele naturala, talpa confortabila. Design minimalist si versatil.',
    449.00,
    549.00,
    (SELECT id FROM categories WHERE slug = 'incaltaminte'),
    'Nike',
    true,
    true,
    ARRAY['38', '39', '40', '41', '42', '43', '44'],
    ARRAY['Alb', 'Alb/Negru'],
    ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800']
  ),
  (
    'Geanta Tote Leather',
    'geanta-tote-leather',
    'Geanta tote din piele naturala, perfecta pentru birou sau cumparaturi.',
    599.00,
    NULL,
    (SELECT id FROM categories WHERE slug = 'accesorii'),
    'Michael Kors',
    true,
    false,
    ARRAY['Universal'],
    ARRAY['Negru', 'Maro', 'Nude'],
    ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (product_id, author_name, rating, title, content, is_verified_purchase, is_approved) VALUES
  (
    (SELECT id FROM products WHERE slug = 'tricou-premium-cotton'),
    'Maria A.',
    5,
    'Calitate excelenta!',
    'Materialul este foarte placut la atingere, croiala perfecta. Recomand!',
    true,
    true
  ),
  (
    (SELECT id FROM products WHERE slug = 'sneakers-urban-white'),
    'Alexandru P.',
    5,
    'Foarte comozi',
    'Ii port zilnic de 2 luni si arata ca noi. Super confortabili.',
    true,
    true
  ),
  (
    (SELECT id FROM products WHERE slug = 'rochie-midi-floral'),
    'Elena M.',
    4,
    'Frumoasa rochie',
    'Culori vibrante, material de calitate. Un pic mare la talie dar in rest perfecta.',
    true,
    true
  )
ON CONFLICT DO NOTHING;
