# UrbanSole - Premium Shoe E-commerce Platform

This is a [Next.js](https://nextjs.org) project for UrbanSole, a premium shoe e-commerce platform. The frontend has been migrated from React to Next.js for improved performance and SEO.

## 🚀 Features

- **Server-Side Rendering (SSR)** for better performance
- **Static Site Generation (SSG)** for optimal loading
- **Responsive Design** with Tailwind CSS
- **Modern UI/UX** with smooth animations
- **Product Catalog** with filtering and search
- **Shopping Cart** functionality
- **User Authentication** 
- **Payment Integration** with Stripe
- **Admin Panel** for product management

## 🛠 Tech Stack

- **Framework**: Next.js 16.2.1 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, React Icons
- **HTTP Client**: Axios
- **Payment**: Stripe
- **Carousel**: Swiper.js
- **TypeScript**: Full TypeScript support

## 📦 Dependencies

### Core Dependencies
- `next` - React framework for production
- `react` & `react-dom` - Core React library
- `tailwindcss` - Utility-first CSS framework
- `typescript` - Type-safe JavaScript

### Additional Dependencies
- `@stripe/react-stripe-js` & `@stripe/stripe-js` - Payment processing
- `axios` - HTTP client for API calls
- `lucide-react` - Beautiful icon library
- `react-icons` - Popular icon collection
- `swiper` - Modern touch slider

## 🚀 Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (routes)/        # Dynamic routes
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable components
│   │   ├── Admin/          # Admin panel components
│   │   ├── Cart/           # Shopping cart
│   │   ├── Checkout/       # Payment flow
│   │   ├── FooterNav/      # Footer navigation
│   │   ├── Registration/   # Authentication
│   │   └── ...             # Other components
│   └── data/               # Static data files
├── public/                 # Static assets
├── next.config.ts         # Next.js configuration
└── package.json           # Dependencies and scripts
```

## 🔄 Migration from React

This project was successfully migrated from a React + Vite setup to Next.js with the following changes:

1. **Routing**: React Router → Next.js App Router
2. **Navigation**: `react-router-dom` → Next.js `Link` and `useRouter`
3. **Build Tool**: Vite → Next.js with Turbopack
4. **Performance**: Client-side rendering → SSR/SSG
5. **SEO**: Improved with server-side rendering

## 🌐 API Integration

The frontend connects to the backend API at:
- Production: `https://api-shoe-ecommerce.onrender.com`
- Development: Proxied through `/api/*` routes

## 🛒 E-commerce Features

- **Product Catalog**: Browse shoes by category, brand, gender
- **Product Details**: Detailed view with image galleries
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout**: Secure payment processing with Stripe
- **User Authentication**: Login, registration, profile management
- **Admin Panel**: Product management, order tracking

## 🎨 Styling

The project uses Tailwind CSS for styling with custom configurations:
- Inter font family
- Custom color scheme
- Responsive breakpoints
- Smooth animations and transitions

## 📱 Responsive Design

- **Mobile**: 320px and up
- **Tablet**: 640px and up  
- **Desktop**: 1024px and up
- **Large Desktop**: 1280px and up

## 🚀 Build & Deploy

### Build for production:

```bash
npm run build
```

### Start production server:

```bash
npm start
```

### Deploy on Vercel:

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## 🔧 Development

### Linting:

```bash
npm run lint
```

### Type Checking:

```bash
npm run type-check
```

## 📄 License

This project is part of the UrbanSole e-commerce platform.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
