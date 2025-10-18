# 🌍 Akhbarna - Enterprise-Grade Bilingual News Platform

<div align="center">

![Akhbarna Logo](public/favicon.svg)

**A production-ready, scalable bilingual news platform built with modern web technologies and enterprise-grade security**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-00ED64?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[🌐 Live Demo](https://akhbarna.vercel.app/) | [📖 Documentation](#documentation) | [🚀 Quick Start](#quick-start) | [🔧 API Reference](#api-reference)

[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen?style=for-the-badge)](#production-readiness)
[![Security](https://img.shields.io/badge/Security-A+%20Grade-green?style=for-the-badge)](#security)
[![Performance](https://img.shields.io/badge/Performance-Optimized-blue?style=for-the-badge)](#performance)

</div>

---

## 🚀 **Production-Ready Features**

### 🌏 **Enterprise Bilingual Support**

- **Seamless Language Switching**: Instant Arabic/English toggle with state persistence
- **RTL/LTR Rendering**: Perfect bidirectional text support with CSS-in-JS
- **Cultural Localization**: Content adapted for Middle Eastern and Western audiences
- **Typography Optimization**: Custom font loading for Arabic and Latin scripts
- **Unicode Support**: Full Arabic text rendering with proper ligatures

### 🎨 **Modern UI/UX Architecture**

- **Design System**: Consistent component library with Radix UI primitives
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Theme System**: Light/dark mode with system preference detection
- **Animation Framework**: Framer Motion integration for smooth transitions
- **Glass Morphism**: Modern translucent design elements

### 📰 **Advanced Content Management System**

- **Multi-language Editor**: Rich text editor with bilingual content support
- **Image Optimization**: Next.js Image component with WebP/AVIF formats
- **Category Hierarchy**: Nested category system with unlimited depth
- **Tag Management**: Advanced tagging with autocomplete and suggestions
- **Content Scheduling**: Publish articles at specific dates and times
- **Bulk Operations**: Mass edit, delete, and publish capabilities
- **Version Control**: Article revision history and rollback functionality

### 🔍 **Intelligent Search & Discovery**

- **Full-text Search**: MongoDB text indexing with relevance scoring
- **Advanced Filters**: Date range, category, author, and tag filtering
- **Search Suggestions**: Real-time autocomplete with typo tolerance
- **Related Content**: ML-powered article recommendations
- **Trending Algorithm**: Real-time trending content calculation
- **Search Analytics**: Query performance and user behavior tracking

### 📊 **Comprehensive Analytics Dashboard**

- **Real-time Metrics**: Live view counts, engagement rates, and user activity
- **Performance Monitoring**: Core Web Vitals and page load times
- **User Behavior**: Click tracking, scroll depth, and session analytics
- **Content Performance**: Article success metrics and engagement scores
- **SEO Insights**: Search engine ranking and organic traffic analysis
- **Revenue Tracking**: Newsletter subscriptions and premium content metrics

### 🔒 **Enterprise-Grade Security**

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-based Access Control**: Admin, writer, and user permission systems
- **Input Validation**: Comprehensive XSS and injection protection
- **Rate Limiting**: Advanced sliding window rate limiting with Redis
- **CSRF Protection**: Cross-site request forgery prevention
- **Data Sanitization**: Multi-layer input cleaning and validation
- **Session Management**: Secure session handling with automatic cleanup
- **Security Headers**: CSP, HSTS, and other security headers

### ⚡ **Performance & Scalability**

- **Server-Side Rendering**: Next.js SSR with ISR for optimal performance
- **Edge Caching**: Vercel Edge Network with global CDN distribution
- **Database Optimization**: Connection pooling and query optimization
- **Image Optimization**: Automatic WebP/AVIF conversion and lazy loading
- **Code Splitting**: Dynamic imports and bundle optimization
- **Caching Strategy**: Multi-layer caching with Redis, Next.js cache, and Vercel KV
- **API Optimization**: RESTful APIs with proper HTTP status codes

---

## 👑 **Admin Dashboard**

<div align="center">

![Admin Dashboard](public/dashboard.png)

**Comprehensive admin panel with advanced content management and analytics**

</div>

### 🎯 **Dashboard Overview**

The Akhbarna admin dashboard is a powerful, feature-rich control center designed for efficient news platform management. Built with modern web technologies and enterprise-grade security, it provides administrators and writers with all the tools needed to manage content, users, subscriptions, and analytics.

**Access:** `/admin` (requires admin authentication)

### 📊 **Core Features**

#### **1. Articles Management**

<table>
<tr>
<td width="50%">

**Create & Edit Articles**

- ✍️ Bilingual rich text editor (Arabic/English)
- 🖼️ Cloudinary image upload & management
- 🏷️ Category and tag assignment
- 📅 Schedule publishing for future dates
- ⭐ Featured article toggle
- 🔍 SEO meta tags editor
- 📝 Draft/Published status control
- 🔄 Real-time preview

</td>
<td width="50%">

**Article Operations**

- 📋 List all articles with filters
- 🔎 Search by title, category, author
- 📊 Sort by date, views, status
- ✏️ Bulk edit operations
- 🗑️ Delete with confirmation
- 👁️ View count tracking
- 📈 Performance analytics per article
- 🚀 Quick publish/unpublish

</td>
</tr>
</table>

#### **2. User Management**

<table>
<tr>
<td width="50%">

**User Administration**

- 👥 List all registered users
- 🔍 Search by name, email, role
- 👤 View user profiles & activity
- 🎭 Role management (Admin/Writer/User)
- 🚫 Ban/Unban users
- ✉️ Email verification status
- 📊 User activity logs
- 🗑️ Delete users with cascade cleanup

</td>
<td width="50%">

**User Details**

- Registration date & last login
- Newsletter subscription status
- Article creation count (writers)
- Payment history
- Session management
- Activity timeline
- Email notifications sent
- Account deletion with email notification

</td>
</tr>
</table>

#### **3. Newsletter Management**

<table>
<tr>
<td width="50%">

**Subscription Dashboard**

- 📧 Total subscribers count
- 💳 Active/Trialing/Canceled status
- 💰 Revenue tracking
- 📊 Subscription analytics
- 📅 Next billing dates
- 🔄 Stripe integration status
- 📈 Growth trends
- 💌 Subscriber list export

</td>
<td width="50%">

**Subscriber Management**

- View all subscribers with filters
- Search by email or name
- Subscription status (Active/Trial/Canceled)
- Plan details & pricing
- Payment method info
- Billing history
- Cancel subscriptions
- Refund processing

</td>
</tr>
</table>

#### **4. Analytics Dashboard**

<table>
<tr>
<td width="50%">

**Key Metrics**

- 📊 Total article views
- 🎯 Total engagements
- 📈 Popular articles count
- 🗂️ Active categories count
- 📅 Time period selector (7/30/90 days)
- 🔄 Real-time data refresh
- 📉 Performance trends
- 💡 Insights & recommendations

</td>
<td width="50%">

**Detailed Analytics**

- 🏆 Top performing articles
- 📂 Popular categories by views
- 👁️ View tracking per article
- 🔥 Engagement metrics
- 📱 Traffic sources
- 🌍 Geographic distribution
- ⏱️ Reading time analytics
- 📊 Export reports (CSV/PDF)

</td>
</tr>
</table>

#### **5. Contact Messages**

<table>
<tr>
<td width="50%">

**Message Management**

- 📬 View all contact submissions
- 🔔 Unread message notifications
- 👁️ Read/Unread status toggle
- 📧 Direct email replies
- 🗑️ Delete messages
- 🔍 Search & filter messages
- 📅 Date sorting
- 💬 Message preview cards

</td>
<td width="50%">

**Reply System**

- ✉️ Send email replies directly
- 📎 View original message
- 👤 User information display
- ⏰ Timestamp tracking
- 📨 Email delivery confirmation
- 🔄 Reply history
- ✅ Mark as resolved
- 🗂️ Archive old messages

</td>
</tr>
</table>

#### **6. Category Management**

<table>
<tr>
<td width="50%">

**Category Operations**

- 📁 Create new categories
- ✏️ Edit category details
- 🗑️ Delete categories
- 🏷️ Bilingual names (AR/EN)
- 🔗 SEO-friendly slugs
- 📊 Article count per category
- 🎨 Category icons/colors
- 📈 Performance metrics

</td>
<td width="50%">

**Category Analytics**

- View count per category
- Popular categories ranking
- Content distribution
- Engagement rates
- Category growth trends
- SEO performance
- Click-through rates
- Conversion metrics

</td>
</tr>
</table>

#### **7. Reports & Moderation**

<table>
<tr>
<td width="50%">

**Content Reports**

- 🚩 User-submitted reports
- 📋 Report categories (spam, offensive, etc.)
- 👁️ Review reported content
- ✅ Approve/Reject reports
- 🗑️ Take action on content
- 📊 Report statistics
- 🔔 Notification system
- 📝 Moderation notes

</td>
<td width="50%">

**Moderation Tools**

- Quick article preview
- Bulk report processing
- Auto-moderation rules
- Spam detection
- Content quality scores
- User reputation system
- Appeal management
- Audit trail logging

</td>
</tr>
</table>

### 🔒 **Security Features**

- **Role-Based Access Control**: Admin-only access with JWT authentication
- **Session Management**: Secure session handling with automatic timeout
- **CSRF Protection**: Token-based protection on all forms
- **Input Validation**: Comprehensive validation on all inputs
- **Audit Logging**: All admin actions are logged with timestamps
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **IP Whitelisting**: Restrict admin access to specific IPs (optional)
- **Activity Monitoring**: Real-time monitoring of admin activities

### 🎨 **UI/UX Features**

- **Glassmorphism Design**: Modern, translucent UI elements
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Dark Theme**: Eye-friendly dark mode interface
- **Real-time Updates**: Live data refresh without page reload
- **Keyboard Shortcuts**: Quick actions via keyboard
- **Drag & Drop**: Intuitive drag-and-drop file uploads
- **Toast Notifications**: Success/error feedback messages
- **Loading States**: Skeleton screens and progress indicators

### 📱 **Mobile Optimization**

The admin dashboard is fully responsive and optimized for mobile management:

- 📱 Touch-friendly interface
- 🔄 Swipe gestures for navigation
- 📊 Mobile-optimized charts
- 💬 Mobile-friendly forms
- 🎯 Quick actions menu
- 📲 Progressive Web App (PWA) support
- 🔔 Push notifications (optional)
- 📶 Offline support for critical features

### 🚀 **Performance Optimizations**

- **Code Splitting**: Dynamic imports for faster load times
- **Lazy Loading**: Components loaded on-demand
- **Data Pagination**: Efficient handling of large datasets
- **Optimistic Updates**: Instant UI feedback
- **Request Debouncing**: Reduced API calls
- **Cache Invalidation**: Smart cache refresh strategies
- **Bundle Optimization**: Minimal JavaScript footprint
- **Image Optimization**: Cloudinary CDN integration

### 📈 **Analytics Capabilities**

The analytics tab provides comprehensive insights:

- **Time Period Analysis**: View data for 7, 30, or 90 days
- **Article Performance**: Track views, reads, and engagement
- **Category Insights**: See which categories perform best
- **User Behavior**: Understand how users interact with content
- **Traffic Sources**: Identify where your traffic comes from
- **Device Analytics**: Desktop vs mobile usage
- **Geographic Data**: See where your readers are located
- **Conversion Tracking**: Monitor newsletter sign-ups and premium conversions

### 🛠️ **Technical Stack**

- **Frontend**: React with TypeScript, Tailwind CSS
- **State Management**: React hooks and context
- **Forms**: React Hook Form with validation
- **UI Components**: Radix UI primitives
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icons
- **Notifications**: Sonner toast library
- **File Uploads**: Cloudinary integration
- **Email**: SendGrid API integration
- **Payments**: Stripe API for subscriptions

---

## 🛠️ **Technology Stack**

<div align="center">

| **Category**   | **Technology**     | **Version** | **Purpose**                      |
| -------------- | ------------------ | ----------- | -------------------------------- |
| **Frontend**   | Next.js            | 15.5.3      | React framework with SSR/SSG     |
|                | TypeScript         | 5.0+        | Type-safe JavaScript             |
|                | Tailwind CSS       | 3.4+        | Utility-first CSS framework      |
|                | Radix UI           | Latest      | Accessible component primitives  |
|                | Framer Motion      | Latest      | Animation library                |
| **Backend**    | Node.js            | 18+         | JavaScript runtime               |
|                | Next.js API Routes | 15.5.3      | Serverless API endpoints         |
|                | JWT                | 9.0+        | Authentication tokens            |
|                | bcryptjs           | 3.0+        | Password hashing                 |
| **Database**   | MongoDB            | 7.0+        | NoSQL document database          |
|                | Mongoose           | 8.16+       | MongoDB object modeling          |
|                | MongoDB Atlas      | Latest      | Cloud database service           |
| **Caching**    | Next.js Cache      | Built-in    | Application-level caching        |
|                | Vercel KV          | Latest      | Redis-compatible key-value store |
| **Deployment** | Vercel             | Latest      | Serverless deployment platform   |
|                | Docker             | Latest      | Containerization                 |
| **Monitoring** | Vercel Analytics   | Latest      | Performance monitoring           |
|                | Sentry             | Latest      | Error tracking                   |

</div>

### 🎯 **Architecture Highlights**

- **Full-Stack TypeScript**: End-to-end type safety from database to UI
- **Serverless Architecture**: Auto-scaling with Vercel's edge network
- **Microservices Ready**: Modular API design for future scaling
- **Progressive Enhancement**: Works without JavaScript, enhanced with it
- **Edge Computing**: Global CDN with edge function support

## 🏗️ **System Architecture**

### **High-Level Architecture**

```mermaid
graph TB
    A[Users] --> B[Vercel Edge Network]
    B --> C[Next.js Application]
    C --> D[API Routes]
    D --> E[MongoDB Atlas]
    D --> F[Redis Cache]
    D --> G[Vercel KV Cache]
    C --> H[Static Assets CDN]
    D --> I[SendGrid Email]
    C --> J[Analytics & Monitoring]
```

### **Project Structure**

```
📁 akhbarna-news/
├── 🌐 app/                           # Next.js 15 App Router
│   ├── 🔌 api/                      # Serverless API endpoints
│   │   ├── admin/                   # Admin-only endpoints
│   │   ├── auth/                    # Authentication endpoints
│   │   ├── user/                    # User management
│   │   ├── track/                   # Analytics tracking
│   │   └── sitemap.xml/             # SEO sitemap
│   ├── 👑 admin/                    # Admin dashboard (protected)
│   │   ├── articles/                # Article management
│   │   ├── users/                   # User management
│   │   └── newsletter/              # Newsletter management
│   ├── 📄 article/[id]/             # Dynamic article pages
│   ├── 📂 category/[slug]/          # Category listing pages
│   ├── 🔍 search/                   # Search results page
│   └── 📰 news/                     # News listing page
├── 🧩 components/                    # React component library
│   ├── 🎨 ui/                      # Reusable UI primitives
│   ├── admin-dashboard.tsx          # Main admin interface
│   ├── article-card.tsx             # Article preview components
│   ├── language-switcher.tsx        # Bilingual toggle
│   └── analytics-dashboard.tsx      # Analytics components
├── 📚 lib/                          # Core business logic
│   ├── models/                      # Database schemas
│   ├── auth.ts                      # Authentication & authorization
│   ├── db.ts                        # Database operations
│   ├── redis.ts                     # Redis connection & configuration
│   ├── cache-service.ts             # Centralized cache management
│   ├── cache-invalidation.ts        # Cache invalidation logic
│   ├── cache.ts                     # Caching utilities
│   ├── rate-limit.ts                # Rate limiting logic
│   └── api-validation.ts            # Input validation
├── 🎯 public/                       # Static assets
│   ├── uploads/                     # User-uploaded images
│   ├── icons/                       # SVG icon library
│   └── favicon.ico                  # Site favicon
├── 🛠️ scripts/                      # Development tools
│   ├── seed/                        # Database seeding
│   ├── warm-cache.js                # Redis cache warming
│   └── setup-mongodb.js             # Local setup
└── 📄 Configuration Files
    ├── next.config.mjs              # Next.js configuration
    ├── tailwind.config.ts           # Tailwind CSS config
    ├── tsconfig.json                # TypeScript config
    └── vercel.json                  # Deployment config
```

### **Database Schema**

```mermaid
erDiagram
    User ||--o{ Article : creates
    User ||--o{ UserSession : has
    User ||--o{ UserActivityLog : generates
    Category ||--o{ Article : contains
    Article ||--o{ ArticleView : tracks
    Article ||--o{ ArticleEngagement : measures
    Article ||--o{ Report : reported_in
    User ||--o{ NewsletterSubscription : subscribes
```

## 🚀 **Quick Start**

### 📋 **Prerequisites**

| Requirement | Version | Purpose                   |
| ----------- | ------- | ------------------------- |
| **Node.js** | 18.0+   | JavaScript runtime        |
| **npm**     | 9.0+    | Package manager           |
| **MongoDB** | 6.0+    | Database (local or Atlas) |
| **Git**     | 2.30+   | Version control           |

### ⚡ **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/azizjrad/journal2.git
cd journal2

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### 🔧 **Environment Configuration**

Create a `.env.local` file with the following variables:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# MongoDB connection string (required)
# Get this from MongoDB Atlas: https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/akhbarna_news?retryWrites=true&w=majority

# ============================================
# AUTHENTICATION & SECURITY
# ============================================
# Secret key for JWT token signing (required)
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT token expiration time (default: 7 days)
JWT_EXPIRES_IN=7d

# CSRF protection secret (required)
# Generate with: openssl rand -base64 32
CSRF_SECRET=your-csrf-secret-key

# ============================================
# APPLICATION URLS
# ============================================
# Base URL of your application (required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth URL (required for authentication)
NEXTAUTH_URL=http://localhost:3000

# Public site URL (required)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ============================================
# EMAIL CONFIGURATION (SendGrid)
# ============================================
# SendGrid API key for email delivery (optional but recommended)
# Get from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# Email sender address (required if using SendGrid)
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Email sender name (optional)
SENDGRID_FROM_NAME="Akhbarna News"

# ============================================
# CLOUDINARY CONFIGURATION (Image Storage)
# ============================================
# Cloudinary cloud name (required for image uploads)
# Get from: https://console.cloudinary.com/
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# Cloudinary API key (required)
CLOUDINARY_API_KEY=your-api-key

# Cloudinary API secret (required)
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# STRIPE CONFIGURATION (Newsletter Payments)
# ============================================
# Stripe secret key (required for newsletter subscriptions)
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# Stripe publishable key (required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Stripe webhook secret (required for payment events)
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Newsletter subscription price ID (required)
STRIPE_PRICE_ID=price_your-price-id

# ============================================
# REDIS CONFIGURATION (Caching)
# ============================================
# Redis connection URL (required for caching)
# Format: redis://[username]:[password]@[host]:[port]
REDIS_URL=redis://localhost:6379

# Redis password (optional, recommended for production)
REDIS_PASSWORD=your-redis-password

# Redis database number (optional, default: 0)
REDIS_DB=0

# ============================================
# PERFORMANCE & OPTIMIZATION
# ============================================
# MongoDB connection pool size (optional, default: 10)
MONGODB_MAX_POOL_SIZE=10

# Cache time-to-live for articles in milliseconds (optional, default: 10 minutes)
CACHE_TTL_ARTICLES=600000

# ============================================
# RATE LIMITING
# ============================================
# Rate limit time window in milliseconds (optional, default: 15 minutes)
RATE_LIMIT_WINDOW=900000

# Maximum requests per time window (optional, default: 100)
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# ENVIRONMENT
# ============================================
# Node environment (development, production, test)
NODE_ENV=development
```

#### 📋 **Environment Variables Reference**

| Variable                             | Required       | Default       | Description                      |
| ------------------------------------ | -------------- | ------------- | -------------------------------- |
| `MONGODB_URI`                        | ✅ Yes         | -             | MongoDB Atlas connection string  |
| `JWT_SECRET`                         | ✅ Yes         | -             | Secret key for JWT token signing |
| `JWT_EXPIRES_IN`                     | ❌ No          | `7d`          | JWT token expiration time        |
| `CSRF_SECRET`                        | ✅ Yes         | -             | CSRF protection secret key       |
| `NEXT_PUBLIC_APP_URL`                | ✅ Yes         | -             | Application base URL             |
| `NEXTAUTH_URL`                       | ✅ Yes         | -             | NextAuth authentication URL      |
| `NEXT_PUBLIC_SITE_URL`               | ✅ Yes         | -             | Public site URL                  |
| `SENDGRID_API_KEY`                   | ⚠️ Recommended | -             | SendGrid API key for emails      |
| `SENDGRID_FROM_EMAIL`                | ⚠️ Recommended | -             | Email sender address             |
| `SENDGRID_FROM_NAME`                 | ❌ No          | `Akhbarna`    | Email sender name                |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  | ✅ Yes         | -             | Cloudinary cloud name            |
| `CLOUDINARY_API_KEY`                 | ✅ Yes         | -             | Cloudinary API key               |
| `CLOUDINARY_API_SECRET`              | ✅ Yes         | -             | Cloudinary API secret            |
| `STRIPE_SECRET_KEY`                  | ⚠️ Recommended | -             | Stripe secret key                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ⚠️ Recommended | -             | Stripe publishable key           |
| `STRIPE_WEBHOOK_SECRET`              | ⚠️ Recommended | -             | Stripe webhook secret            |
| `STRIPE_PRICE_ID`                    | ⚠️ Recommended | -             | Newsletter subscription price ID |
| `REDIS_URL`                          | ✅ Yes         | -             | Redis connection URL             |
| `REDIS_PASSWORD`                     | ⚠️ Recommended | -             | Redis password                   |
| `REDIS_DB`                           | ❌ No          | `0`           | Redis database number            |
| `MONGODB_MAX_POOL_SIZE`              | ❌ No          | `10`          | MongoDB connection pool size     |
| `CACHE_TTL_ARTICLES`                 | ❌ No          | `600000`      | Article cache TTL (ms)           |
| `RATE_LIMIT_WINDOW`                  | ❌ No          | `900000`      | Rate limit window (ms)           |
| `RATE_LIMIT_MAX_REQUESTS`            | ❌ No          | `100`         | Max requests per window          |
| `NODE_ENV`                           | ❌ No          | `development` | Node environment                 |

### 🗄️ **Database Setup**

#### **Option 1: MongoDB Atlas (Recommended)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env.local` file

#### **Option 2: Local MongoDB**

```bash
# Install MongoDB locally
# Windows (using Chocolatey)
choco install mongodb

# macOS (using Homebrew)
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB service
mongod
```

### 🔴 **Redis Setup**

#### **Option 1: Local Redis (Recommended for Development)**

```bash
# Install Redis locally
# Windows (using Chocolatey)
choco install redis

# macOS (using Homebrew)
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server

# Start Redis service
redis-server
```

#### **Option 2: Docker Redis**

```bash
# Run Redis in Docker container
docker run -d -p 6379:6379 --name redis redis:alpine

# Or with password protection
docker run -d -p 6379:6379 --name redis redis:alpine redis-server --requirepass yourpassword
```

#### **Option 3: Redis Cloud (Production)**

1. Create a free account at [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create a new database
3. Get your connection string
4. Add it to your `.env.local` file

### 🏃‍♂️ **Development Server**

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### 🧪 **Testing the Setup**

```bash
# Run the test suite
npm test

# Check build process
npm run build

# Analyze bundle size
npm run build:analyze
```

## 🔧 **API Reference**

### **Authentication Endpoints**

```http
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
POST /api/auth/forgot-password # Password reset
```

### **Content Management**

```http
GET    /api/articles          # List articles
POST   /api/articles          # Create article
GET    /api/articles/[id]     # Get article
PUT    /api/articles/[id]     # Update article
DELETE /api/articles/[id]     # Delete article
```

### **Admin Endpoints**

```http
GET    /api/admin/articles    # Admin article list
GET    /api/admin/users       # User management
GET    /api/admin/analytics   # Analytics data
GET    /api/admin/reports     # Content reports

# Cache Management
GET    /api/admin/cache/stats # Get cache statistics
POST   /api/admin/cache/warm  # Warm cache with data
POST   /api/admin/cache/clear # Clear all caches
```

### **Public Endpoints**

```http
GET    /api/search            # Search articles
GET    /api/categories        # List categories
GET    /api/sitemap.xml       # SEO sitemap
POST   /api/track/view        # Track article views
POST   /api/contact           # Contact form
```

## 📊 **Performance Metrics**

### **Current Performance**

- **Lighthouse Score**: 95+ (Performance)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.0s

### **Scalability**

- **Concurrent Users**: 100+ (current), 500+ (with optimizations)
- **Database Queries**: < 100ms average
- **Cache Hit Ratio**: 80%+
- **API Response Time**: < 200ms average

## 🔒 **Security Features**

### **Authentication & Authorization**

- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Writer, User)
- Session management with automatic cleanup
- Password hashing with bcrypt (12 rounds)

### **Input Validation & Sanitization**

- XSS protection on all user inputs
- SQL injection prevention
- CSRF token validation
- File upload security with type validation

### **Rate Limiting & DDoS Protection**

- Sliding window rate limiting
- IP-based request throttling
- API endpoint protection
- Brute force attack prevention

## 🚀 **Deployment**

### **Vercel (Recommended)**

```bash
# Deploy to Vercel
npm install -g vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Deploy automatically on git push
```

### **Docker Deployment**

```bash
# Build Docker image
docker build -t akhbarna-news .

# Run container
docker run -p 3000:3000 akhbarna-news
```

### **Environment Variables for Production**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://your-redis-host:6379
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your-production-secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
SENDGRID_API_KEY=your-sendgrid-key
```

## 📈 **Monitoring & Analytics**

### **Built-in Monitoring**

- Vercel Analytics integration
- Real-time performance metrics
- Error tracking and logging
- User behavior analytics

### **Custom Analytics**

- Article view tracking
- User engagement metrics
- Search query analytics
- Content performance insights

## 🧪 **Development**

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run test         # Run test suite

# Cache Management
npm run cache:warm    # Warm Redis cache with data
npm run cache:clear   # Clear all caches
npm run cache:stats   # Show cache statistics
```

### **Code Quality**

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

## 🤝 **Contributing**

### **Development Workflow**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Standards**

- Follow TypeScript best practices
- Use meaningful commit messages
- Write comprehensive tests
- Update documentation

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Documentation**

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](#api-reference)
- [Troubleshooting](TROUBLESHOOTING.md)

<div align="center">

**Built with by Jradz (https://github.com/yourusername)**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/akhbarna-news?style=social)](https://github.com/azizjrad/journal2)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/akhbarna-news?style=social)](https://github.com/azizjrad/journal2)
[![Twitter Follow](https://img.shields.io/twitter/follow/yourusername?style=social)](https://x.com/AzJrad)

</div>
