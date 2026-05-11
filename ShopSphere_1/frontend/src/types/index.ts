export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: { public_id?: string; url: string };
  role: 'user' | 'admin' | 'vendor';
  phone?: string;
  addresses: Address[];
  wishlist: string[];
  isActive: boolean;
  preferredLanguage: string;
  createdAt: string;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface ProductImage {
  public_id: string;
  url: string;
}

export interface Review {
  _id: string;
  user: string | User;
  name: string;
  rating: number;
  comment: string;
  avatar?: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  category: string;
  subCategory?: string;
  brand: string;
  images: ProductImage[];
  colors: string[];
  sizes: string[];
  stock: number;
  sku?: string;
  reviews: Review[];
  ratings: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface Order {
  _id: string;
  user: string | User;
  orderItems: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'stripe' | 'razorpay' | 'cod';
  paymentResult?: Record<string, string>;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  discountAmount: number;
  totalPrice: number;
  coupon?: { code: string; discount: number };
  orderStatus: string;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  trackingNumber?: string;
  shippingMethod: string;
  estimatedDelivery?: string;
  invoiceNumber: string;
  statusHistory: { status: string; timestamp: string; note?: string }[];
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Order[];
  monthlyRevenue: { _id: string; revenue: number; orders: number }[];
  categoryStats: { _id: string; count: number; avgPrice: number }[];
  categoryDistribution: { _id: string; count: number }[];
  orderStatusStats: { _id: string; count: number }[];
  orderStatusDistribution: { _id: string; count: number }[];
  lowStockProducts: Product[];
}
