# 🛍️ ShopSphere - Full-Stack E-Commerce Platform

A professional e-commerce platform built with **Next.js 14**, **React 18**, **Node.js**, **Express**, and **MongoDB**, inspired by Amazon, Flipkart, Myntra, and Apple Store.

## ✨ Features

### Customer Features
- **Authentication**: JWT (httpOnly cookies) + Google OAuth, password reset via email
- **Product Browsing**: Search, filter by category/brand/price, sort, pagination
- **Product Details**: Image gallery, reviews & ratings, related products, color/size selection
- **Cart & Wishlist**: Add/remove items, guest cart support, quantity management
- **Checkout**: 3-step flow (Address → Payment → Review), coupon codes
- **Payments**: Stripe, Razorpay, Cash on Delivery
- **Orders**: Order tracking, status history, cancellation
- **Profile**: Avatar upload, saved addresses, account settings
- **Dark Mode**: System-aware theme toggle

### Admin Dashboard
- **Analytics**: Revenue, orders, users, category distribution, low stock alerts
- **Product Management**: Full CRUD with image upload (Cloudinary)
- **Order Management**: Status updates with real-time notifications (Socket.io)
- **User Management**: Role assignment, search, delete
- **Coupon Management**: Create/edit percentage & fixed discount coupons

### Technical Highlights
- Real-time updates via **Socket.io**
- **Redis** caching for performance
- Security: Helmet, rate limiting, mongo-sanitize, HPP, CORS
- **TypeScript** frontend with strict typing
- **Redux Toolkit** state management
- **Framer Motion** animations
- Responsive design with **Tailwind CSS**
- SEO-optimized with Next.js metadata

## 🏗️ Project Structure

```
ShopSphere/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, Redis, Socket.io
│   │   ├── controllers/     # Auth, Product, Cart, Order, Payment, Admin
│   │   ├── middleware/       # Auth, error, upload, validation
│   │   ├── models/          # User, Product, Order, Cart, Coupon, Chat
│   │   ├── routes/          # API route definitions
│   │   ├── utils/           # AppError, asyncHandler, email, ApiFeatures
│   │   └── server.js        # Entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Layout & UI components
│   │   ├── lib/             # API client, Socket.io
│   │   ├── store/           # Redux store & slices
│   │   └── types/           # TypeScript interfaces
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional, for caching)

### 1. Clone & Install

```bash
git clone <repo-url>
cd ShopSphere

# Backend
cd backend
cp .env.example .env    # Fill in your env vars
npm install

# Frontend
cd ../frontend
cp .env.example .env    # Fill in your env vars
npm install
```

### 2. Configure Environment Variables

**Backend `.env`:**
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CLOUDINARY_*` | Cloudinary credentials |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `RAZORPAY_KEY_ID/SECRET` | Razorpay credentials |
| `SMTP_*` | Email service credentials |
| `REDIS_URL` | Redis connection URL |
| `CLIENT_URL` | Frontend URL (CORS) |

**Frontend `.env`:**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_RAZORPAY_KEY` | Razorpay key ID |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |

### 3. Run Development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Backend: `http://localhost:5000`
Frontend: `http://localhost:3000`

### 4. Docker (Production)

```bash
docker-compose up --build
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/google` | Google OAuth login |
| GET | `/api/v1/products` | List products (search, filter, sort) |
| GET | `/api/v1/products/slug/:slug` | Get product by slug |
| POST | `/api/v1/products/:id/reviews` | Add review |
| GET | `/api/v1/cart` | Get cart |
| POST | `/api/v1/cart` | Add to cart |
| POST | `/api/v1/orders` | Create order |
| GET | `/api/v1/orders/my-orders` | User's orders |
| POST | `/api/v1/payment/stripe/create-intent` | Stripe payment |
| POST | `/api/v1/payment/razorpay/create-order` | Razorpay payment |
| GET | `/api/v1/admin/dashboard` | Admin dashboard stats |
| GET | `/api/v1/admin/orders` | Admin: all orders |
| GET | `/api/v1/admin/users` | Admin: all users |

## 🚢 Deployment

- **Frontend**: Deploy to [Vercel](https://vercel.com) — auto-detects Next.js
- **Backend**: Deploy to [Railway](https://railway.app) or [Render](https://render.com)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Redis**: [Upstash](https://upstash.com) or [Redis Cloud](https://redis.com/cloud/)

## 📄 License

MIT
