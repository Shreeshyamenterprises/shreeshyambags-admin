export type User = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  basePrice?: number | null;
};

export type Variant = {
  id: string;
  productId: string;
  size: string;
  color: string;
  shape: string;
  price: number;
  stock: number;
  sku?: string | null;
};

export type OrderItem = {
  id: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  customText?: string | null;
  size: string;
  color: string;
  shape: string;
};

export type Order = {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  shipName: string;
  shipPhone: string;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  createdAt: string;
  items: OrderItem[];
};
