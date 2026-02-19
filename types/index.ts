// Product Types
export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  category: 'femei' | 'barbati' | 'sneakers' | 'noutati';
  subcategory: string | null;
  brand: string | null;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  stock: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  rating: number;
  reviews_count: number;
  styling_suggestions: string[] | null;
  created_at: string;
  updated_at: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Address Types
export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  county: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
}

// Order Types
export type PaymentMethod = 'card' | 'ramburs' | 'rate';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type DeliveryMethod = 'curier_rapid' | 'curier_gratuit' | 'ridicare';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_county: string;
  shipping_postal_code: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_method: DeliveryMethod;
  status: OrderStatus;
  stripe_payment_intent_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

// Review Types
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  users?: {
    full_name: string | null;
  };
}

// Cart Types
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  products?: Product;
}

export interface LocalCartItem {
  product_id: string;
  product: Product;
  size: string | null;
  color: string | null;
  quantity: number;
}

// Newsletter Types
export interface Newsletter {
  id: string;
  email: string;
  subscribed: boolean;
  created_at: string;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  brands?: string[];
  colors?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'bestseller';
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}
