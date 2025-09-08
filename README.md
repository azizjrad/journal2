# 🌍 Akhbarna - Bilingual News Website

<div align="center">

![Akhbarna Logo](public/favicon.svg)

**A cutting-edge bilingual news platform delivering real-time Arabic and English content with modern web technologies**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-00ED64?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[🌐 Live Demo](#) | [📖 Documentation](#installation) | [🚀 Quick Start](#quick-start)

</div>

---

## ✨ Features That Set Us Apart

### 🌏 **True Bilingual Experience**

- **Seamless Language Switching**: Switch between Arabic and English with a single click
- **RTL/LTR Support**: Perfect text direction handling for both languages
- **Cultural Localization**: Content adapted for different cultural contexts
- **Dynamic Font Optimization**: Optimized typography for both Arabic and Latin scripts

### 🎨 **Modern Design & UX**

- **Glass Morphism UI**: Beautiful translucent design elements
- **Dark Theme**: Eye-friendly dark mode with glass effects
- **Mobile-First**: Responsive design that works perfectly on all devices
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation support
- **Smooth Animations**: Elegant transitions and micro-interactions

### 📰 **Advanced Content Management**

- **Rich Article Editor**: WYSIWYG editor with bilingual content support
- **Smart Image Handling**: Drag-and-drop upload with automatic optimization
- **Category Management**: Hierarchical content organization
- **Tag System**: Advanced tagging for better content discovery
- **Content Scheduling**: Plan and schedule article publications
- **Bulk Operations**: Efficient management of multiple articles

### 🔍 **Search & Discovery**

- **Advanced Search**: Multi-language search with filters
- **Auto-complete**: Smart search suggestions
- **Category Browsing**: Intuitive content navigation
- **Related Articles**: Content recommendations
- **Trending Topics**: Real-time trending content tracking

### 📊 **Analytics & Insights**

- **Real-time Analytics**: Live view counts and engagement metrics
- **Performance Dashboard**: Comprehensive admin analytics
- **User Engagement Tracking**: Article interaction monitoring
- **SEO Performance**: Search engine optimization insights
- **Content Performance**: Article success metrics

### 🔒 **Security**

- **Secure Authentication**: Protected admin access
- **Input Validation**: XSS and injection protection
- **File Upload Security**: Safe image handling with validation
- **Rate Limiting**: API protection against abuse
- **Data Sanitization**: Clean and secure content processing

### ⚡ **Performance & SEO**

- **Fast**: Optimized for Core Web Vitals
- **SEO Optimized**: Dynamic meta tags and structured data
- **XML Sitemaps**: Automatic search engine indexing
- **Social Media Ready**: Open Graph and Twitter Card support
- **PWA Ready**: Progressive Web App capabilities

## 🛠️ **Tech Stack**

<div align="center">

| Frontend     | Backend     | Database | Deployment |
| ------------ | ----------- | -------- | ---------- |
| Next.js 15   | Node.js     | MongoDB  | Vercel     |
| TypeScript   | API Routes  | Mongoose | Docker     |
| Tailwind CSS | Serverless  |          | Cloud/VPS  |
| Radix UI     | Next.js API |          |            |

</div>

### 🎯 **Core Technologies**

- **Next.js 15 (App Router)** with Server and Client Components
- **TypeScript** for type safety
- **MongoDB + Mongoose** for data persistence
- **Tailwind CSS** and **Radix UI** for UI

## 🏗️ **Architecture & Structure**

```
📁 akhbarna-news/
├── 🌐 app/                    # Next.js App Router
│   ├── 🔌 api/               # API endpoints
│   ├── 👑 admin/             # Admin dashboard pages
│   ├── 📄 article/[slug]/    # Dynamic article pages (SEO-friendly)
│   ├── 📂 category/[slug]/   # Category listing pages
│   ├── 🔍 search/            # Search results page
│   └── 📰 news/              # News listing page
├── 🧩 components/            # React components
│   ├── 🎨 ui/               # Reusable UI components
│   ├── admin-dashboard.tsx   # Main admin interface
│   ├── article-card.tsx      # Article preview cards
│   ├── language-switcher.tsx # Bilingual toggle
│   └── hero-carousel.tsx     # Featured content slider
├── 📚 lib/                   # Core utilities
│   ├── dbConnect.ts          # MongoDB connection helper
│   ├── db.ts                 # Database operations (Mongoose)
│   ├── auth.ts               # Authentication logic (JWT, bcrypt)
│   ├── language-context.tsx  # Internationalization state
│   └── utils.ts              # Helper functions
├── 🎯 public/               # Static assets
│   ├── uploads/              # User-uploaded images
│   ├── *.svg                 # Vector icons
│   └── favicon.ico           # Site favicon
└── 🛠️ scripts/              # Database & tools
    ├── seed/                 # Sample data
    └── setup-mongodb.js      # Local MongoDB setup
```

## 🚀 **Quick Start**

### 📋 **Prerequisites**

```bash
Node.js 18+ ✅
MongoDB 6+ (local or Atlas) ✅
Git ✅
```

### ⚡ **Setup**

```bash
# Clone the repository
git clone <repository-url>
cd akhbarna-news

# Install dependencies
npm install

# Environment setup
cp .env.local.example .env.local
```

### 🔧 **Environment Configuration**

The app reads these variables:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# Auth
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 🗄️ **Database Setup**

- For Atlas, create a cluster and use the connection string as `MONGODB_URI`.
- For local, ensure `mongod` is running or use the provided `scripts/setup-mongodb.js`.

No SQL, Postgres, or Neon setup is required. All data is stored in MongoDB.

### 🏃‍♂️ **Run the App**

```bash
npm run dev
# Open http://localhost:3000
```

## 🎯 **Feature Highlights**

- Bilingual content with RTL/LTR support
- Admin dashboard for articles, categories, users
- Comments system with moderation
- Analytics and view tracking
- Advanced search with filtering

## 🌐 API Endpoints (selected)

- `GET /api/sitemap.xml` - XML sitemap
- `POST /api/track/view` - Track article views
- `POST /api/track/engagement` - Track user engagement
- `POST /api/user-auth/login` - User login
- `POST /api/user-auth/register` - User registration
- `GET/POST /api/admin/*` - Admin operations

## 🎨 Components

- `components/article-card.tsx` - Article display
- `components/new-article-form.tsx` - Article creation
- `components/edit-article-form.tsx` - Article editing
- `components/analytics-dashboard.tsx` - Analytics
- `components/admin-dashboard.tsx` - Admin interface

## 🔍 SEO

- Dynamic Open Graph/Twitter tags via `app/layout.tsx`
- Automatic sitemap and robots.txt

## 🧪 Development

- TypeScript enabled
- Tailwind CSS with custom theme tokens
- Linting available (can be enabled in CI)

## 📄 License

MIT
