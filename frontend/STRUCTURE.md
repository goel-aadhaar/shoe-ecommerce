# Production-Grade Frontend Structure

This document outlines the restructured, production-grade folder organization and naming conventions for the shoe e-commerce frontend.

## 📁 Folder Structure

```
src/
├── app/                          # Next.js 15+ App Router
│   ├── (routes)/                # Route groups
│   ├── api/                     # API routes
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # React components
│   ├── features/               # Feature-specific components
│   │   ├── auth/              # Authentication components
│   │   ├── cart/              # Shopping cart components
│   │   ├── checkout/          # Checkout flow components
│   │   ├── admin/             # Admin panel components
│   │   └── brand/             # Brand-related components
│   ├── shared/                # Reusable components
│   │   ├── ui/               # Basic UI components (Button, Card, etc.)
│   │   ├── loading/          # Loading states and skeletons
│   │   └── layout/           # Layout components (Header, Footer, etc.)
│   └── layout/                # Layout-specific components
├── hooks/                     # Custom React hooks
├── lib/                       # Third-party library configurations
├── services/                  # API service layers
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
├── constants/                 # Application constants
└── data/                      # Static data files (JSON)
```

## 🎯 Naming Conventions

### Files
- **Components**: PascalCase (e.g., `ShoeCard.tsx`, `ImageSlider.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`, `useLocalStorage.ts`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`, `apiHelpers.ts`)
- **Types**: camelCase (e.g., `index.ts`, `userTypes.ts`)
- **Constants**: camelCase (e.g., `apiConfig.ts`, `appConstants.ts`)

### Folders
- **Features**: kebab-case (e.g., `shopping-cart`, `user-profile`)
- **Shared**: camelCase (e.g., `uiComponents`, `layoutComponents`)
- **General**: camelCase (e.g., `services`, `utilities`)

## 🔧 TypeScript Integration

All components are now written in TypeScript (`.tsx`) with proper type definitions:

### Key Type Definitions
- `Shoe`: Product information structure
- `CartItem`: Shopping cart item structure
- `User`: User account information
- `Order`: Order management structure
- `ApiResponse`: API response wrapper

## 📦 Component Organization

### Feature Components (`/components/features/`)
Organized by business domain:
- `auth/`: Login, registration, password reset
- `cart/`: Cart management, item controls
- `checkout/`: Checkout flow, payment forms
- `admin/`: Product management, order administration

### Shared Components (`/components/shared/`)
Reusable across features:
- `ui/`: Basic UI elements (Button, Card, Input)
- `loading/`: Loading states, skeleton screens
- `layout/`: Navigation, footer, sidebar

## 🛠 Services Architecture

### Service Layer (`/services/`)
- `authService.ts`: Authentication and authorization
- `shoeService.ts`: Product data management
- `cartService.ts`: Shopping cart operations
- `orderService.ts`: Order processing

### API Configuration
- Centralized API endpoints in `/constants/`
- Axios interceptors for auth and error handling
- Type-safe API responses

## 🎨 UI Components

### Base Components
- `Button`: Consistent button styling with variants
- `Card`: Flexible card container
- `LoadingSpinner`: Standardized loading indicator
- `ImageSlider`: Hero carousel component

### Design System
- Consistent color palette
- Standardized spacing and typography
- Responsive design patterns

## 🔐 Security Best Practices

### Authentication
- JWT token management
- Secure storage with localStorage
- Automatic token refresh
- Route protection

### Data Validation
- TypeScript for compile-time safety
- Form validation on client and server
- Sanitized API inputs

## 📱 Performance Optimizations

### Image Handling
- Cloudinary optimization
- Lazy loading
- Responsive images
- Fallback handling

### Code Organization
- Tree-shaking friendly exports
- Dynamic imports for large components
- Efficient state management

## 🔄 State Management

### Local State
- React hooks for component state
- Custom hooks for complex logic
- Context providers for app state

### Server State
- API service layer
- Caching strategies
- Error boundaries

## 🧪 Testing Strategy

### Component Testing
- Unit tests for utilities
- Integration tests for components
- E2E tests for user flows

### Type Safety
- Strict TypeScript configuration
- Interface definitions for all data
- Prop type validation

## 📚 Migration Guide

### From Old Structure
1. `.jsx` → `.tsx` with proper types
2. `shoe_card.jsx` → `components/features/ShoeCard.tsx`
3. `ImageSlider.jsx` → `components/shared/ImageSlider.tsx`
4. Update imports to use new paths

### Import Examples
```typescript
// Old
import ShoeCard from '../components/shoe_card';
import ImageSlider from '../components/ImageSlider';

// New
import { ShoeCard, ImageSlider } from '@/components';
// or specific imports
import ShoeCard from '@/components/features/ShoeCard';
import ImageSlider from '@/components/shared/ImageSlider';
```

## 🚀 Production Considerations

### Build Optimization
- Tree shaking enabled
- Code splitting by routes
- Asset optimization
- Bundle analysis

### Environment Variables
- API endpoints configuration
- Feature flags
- Analytics integration

### Monitoring
- Error tracking
- Performance metrics
- User analytics

## 📝 Development Guidelines

### Code Style
- ESLint configuration for consistency
- Prettier for formatting
- TypeScript strict mode
- Conventional commits

### Component Patterns
- Functional components with hooks
- Props interfaces for all components
- Default exports for components
- Named exports for utilities

This structure ensures scalability, maintainability, and developer productivity while following modern React and Next.js best practices.
