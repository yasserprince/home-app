# ServiceNow - Home Service Booking Platform

## Overview

This is a full-stack home service booking platform that connects customers with local service providers. The application allows users to browse service categories, find providers, book appointments, and manage their service requests through an intuitive mobile-first interface.

## Recent Changes (August 2, 2025)

### Google Maps Integration Completed
- **Interactive Maps**: Added Google Maps JavaScript API integration to location settings
- **Real-time Location**: Users can see their exact location with custom red pin markers
- **Secure API Handling**: Created `/api/maps/config` endpoint for secure key distribution
- **Professional UI**: Clean map integration with loading states and error handling
- **Location Updates**: Maps automatically center and update when user location changes

### Account Management & Location Services Fixed
- **Account Type Switching**: Fixed profile settings with intuitive "Change" button for role switching
- **Location API**: Added `/api/location` PUT endpoint for location preference updates
- **API Syntax Fixes**: Corrected `apiRequest` function calls throughout the application
- **Enhanced UX**: Improved user interface for account type selection and location management

### Dual Authentication System Completed
- **Google OAuth**: Fixed critical session cookie configuration and user creation flow
- **Email/Password**: Complete signup system with comprehensive user information collection
- **Algeria Integration**: All 58 wilayas included in location selection
- **Enhanced Security**: bcrypt password hashing and secure session management
- **Logout System**: Fixed logout functionality with both GET and POST endpoints

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Mobile-First Design
- Responsive design optimized for mobile devices
- Bottom navigation for core app functionality
- Touch-friendly UI components and interactions

## Key Components

### Authentication System
- **Dual Provider**: Google OAuth + Email/Password authentication
- **Google OAuth**: Passport.js with Google Strategy, fixed session cookie configuration
- **Email/Password**: bcrypt hashing, comprehensive signup forms with Algeria wilayas
- **Session Storage**: PostgreSQL-backed sessions with secure cookie settings
- **User Management**: Automatic user creation, role-based signup flow (seeker/provider/company)

### Service Management
- **Categories**: Predefined service categories (Plumbing, Electrical, AC Repair, Cleaning, etc.)
- **Providers**: Service provider profiles with ratings and reviews
- **Bookings**: Appointment scheduling with status tracking
- **Reviews**: Customer feedback and rating system

### Database Schema
- **Users**: Profile information and authentication data
- **Service Categories**: Categorized service types
- **Service Providers**: Provider details, availability, and ratings
- **Bookings**: Appointment scheduling and tracking
- **Reviews**: Customer feedback and ratings
- **Sessions**: Authentication session storage

### UI Components
- **Design System**: shadcn/ui with Radix UI primitives
- **Theming**: CSS variables for consistent styling
- **Responsive Layout**: Mobile-first responsive design
- **Form Controls**: Comprehensive form components with validation

### KYC & Verification System
- **Identity Verification**: Multi-tier verification system with trust scoring
- **Free Services Integration**: Didit unlimited KYC, free SMS services
- **Verification Types**: Email, phone, ID document, background check
- **Trust Score Algorithm**: 0-100 scoring based on verification completion
- **Real-time Status**: Live verification progress tracking
- **Security**: Encrypted document storage and time-limited tokens

### Internationalization System
- **Multi-language Support**: English, French, and Arabic with full RTL support
- **Translation Management**: Centralized translation system using Zustand for state management
- **Language Persistence**: User language preference stored locally and persists across sessions
- **Dynamic Language Switching**: Real-time language switching without page reload
- **RTL Support**: Proper right-to-left text direction for Arabic language
- **Comprehensive Coverage**: All UI elements, messages, and content fully translated
- **Language Selector**: Compact and full variants available throughout the application

## Data Flow

### User Authentication Flow
1. User accesses the application
2. Landing page displayed for unauthenticated users
3. User clicks "Get Started" and is redirected to Replit Auth
4. Successful authentication creates/updates user profile
5. User is redirected to main application

### Service Booking Flow
1. User browses service categories on home page
2. User selects a category and views available providers
3. User selects a provider and views their profile/reviews
4. User fills out booking form with service details
5. Booking is created and confirmation is shown
6. Provider and user can track booking status

### Data Persistence
- All data stored in PostgreSQL database
- Drizzle ORM handles database operations
- Database migrations managed through Drizzle Kit
- Real-time updates through React Query invalidation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework

### Authentication
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect implementation
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Development Environment
- **Local Development**: tsx server with hot reloading
- **Frontend**: Vite dev server with HMR
- **Database**: Neon PostgreSQL (serverless)
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Production Build
- **Frontend**: Vite build to static assets
- **Backend**: esbuild bundle for Node.js
- **Database**: Drizzle migrations applied automatically
- **Session Storage**: PostgreSQL-backed sessions

### Replit Integration
- **Authentication**: Seamless Replit Auth integration
- **Development Tools**: Replit-specific development enhancements
- **Error Handling**: Runtime error overlays for development

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **Sessions**: Secure session management with SESSION_SECRET
- **Auth**: Replit domains configuration for OIDC
- **Build**: Separate client and server build processes

The application follows a monorepo structure with shared types and utilities, ensuring type safety across the full stack while maintaining clear separation of concerns between frontend and backend code.