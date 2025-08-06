# ServiceNow - Home Service Booking Platform

## Overview

This is a full-stack home service booking platform connecting customers with local service providers. It enables users to browse service categories, find providers, book appointments, and manage service requests via an intuitive mobile-first interface. The project aims to provide a comprehensive, modern solution for home service bookings, with a focus on user experience, professional design, and robust functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

### Simplified JWT-Based Authentication (August 2025)
- **Architecture Simplification**: Replaced complex passport + express-session + PostgreSQL setup with stateless JWT tokens
- **OAuth Integration**: Created direct OAuth handlers for Google authentication with JWT token generation
- **Session Elimination**: Removed session deserialization issues that caused 401 errors and redirect loops
- **Modern Upload System**: Updated file upload endpoints to use JWT middleware instead of session-based authentication
- **Stateless Design**: HTTP-only cookies with JWT tokens, works across subdomains, eliminates session persistence issues
- **Comprehensive Auth Service**: Implemented `/api/auth/login`, `/api/auth/google/callback`, `/api/auth/user`, and `/api/debug-jwt` endpoints

### Authentication System Status (August 2025)
- **Google OAuth Flow**: Fully operational - properly redirects to Google's OAuth service
- **JWT Token System**: Generating and verifying tokens correctly with HTTP-only cookies
- **Upload Integration**: All file upload endpoints now use JWT middleware instead of sessions
- **Debug Endpoints**: `/api/debug-jwt` and `/api/auth/user` available for testing authentication state
- **Session Issues Resolved**: Eliminated passport deserialization problems that caused redirect loops

### Deployment Parity Fixes
- **Auto-seeding System**: Categories now automatically seed on production startup to ensure identical content between development and deployment
- **Profile Picture URL Consistency**: Enhanced object storage service with environment-aware logging and consistent URL handling for profile images
- **Comprehensive Verification**: Added `/api/deployment/verify` endpoint to test all critical deployment differences
- **Error Handling**: Fixed TypeScript errors that could cause production runtime issues

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library, applying Material Design dark theme principles (e.g., #121212 base surface color, color elevation). UI/UX features include glassmorphism effects, animated background orbs, and professional card layouts, optimized for mobile with proper contrast ratios (15.8:1).
- **State Management**: TanStack Query (React Query) for server state, with cache invalidation for real-time updates (e.g., profile picture uploads).
- **Form Handling**: React Hook Form with Zod validation for interactive editing and real-time validation.
- **Build Tool**: Vite for development and bundling.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect, complemented by Google OAuth and email/password systems using bcrypt hashing and secure session management.
- **Session Management**: Express sessions with PostgreSQL storage.

### Mobile-First Design
- Responsive design optimized for mobile devices with touch-friendly UI components.
- Features bottom navigation for core app functionality and full RTL support for Arabic language.

### Core Features & Design Decisions
- **Profile System**: Modern redesign with gradient-themed ProfileImageCropper featuring professional editing tools (brightness, contrast, saturation, zoom, rotation) with authentic Arabic/Latin wilaya data for location selection.
- **Translation System**: Comprehensive multi-language support (English, French, Arabic) with `useTranslation` hook, localStorage persistence, and dynamic switching.
- **Authentication Pages**: Triple authentication login page with Google OAuth, email/password, and Replit Auth, featuring a gradient theme and glassmorphism effects.
- **Service Icons**: Dynamic Lucide icon system using database icon names for authentic service representation (Wrench for plumbing, Zap for electrical, etc.) with proper fallback handling.
- **Home & Categories Pages**: Redesigned based on modern app patterns (e.g., TaskRabbit/Thumbtack), featuring intelligent category grouping, enhanced visual hierarchy, and dual view modes.
- **Enhanced Home Dashboard**: Competitive features inspired by top home service apps including:
  - **Emergency Services Section**: 24/7 instant booking for urgent services (plumbing, electrical, lockout, HVAC) with upfront pricing
  - **Special Offers & Promotions**: Dynamic discount cards with first-time user bonuses and subscription packages
  - **Provider Spotlight**: Top-rated service providers with ratings, job counts, and quick access
  - **Trust & Safety Indicators**: Platform statistics (100K+ verified providers, 4.8★ average rating)
- **Modern File Upload System**: Industry-standard implementation with React Dropzone, presigned URLs, and JWT authentication featuring:
  - **React Dropzone Interface**: Professional drag-and-drop upload with progress tracking and error handling
  - **Presigned URL Architecture**: Direct-to-cloud uploads bypassing server for optimal performance and scalability
  - **JWT Authentication**: Secure token-based authentication for upload endpoints with comprehensive session debugging
  - **ACL Policy Management**: Fine-grained access control for uploaded files with public/private visibility settings
  - **Upload Test Page**: Dedicated testing interface at `/upload-test` for debugging and verification
- **Modern Portfolio Gallery System**: Complete redesigned multi-section photo organization system integrated into user profile editing, inspired by TaskRabbit, Thumbtack, and Handy featuring:
  - **Multi-Category Galleries**: Featured Work, Before & After, Work Samples, Tools & Equipment, Certifications with professional tabbed navigation
  - **Object Storage Integration**: Professional file upload system with Uppy dashboard and Google Cloud Storage with proper URL conversion from upload to serving URLs
  - **Advanced Photo Management**: Primary image selection, drag & drop uploads, hover overlays with action buttons (view, edit, delete), professional grid layout
  - **Portfolio Analytics**: Real-time portfolio score calculation, image statistics (total, primary, public), and portfolio completion indicators
  - **Featured Image Showcase**: Dedicated section highlighting primary portfolio image with gradient overlays and professional presentation
  - **Professional UI Elements**: Quality indicators, upload dates, view counts, public/private badges, and portfolio optimization tips
  - **Profile Integration**: Seamless portfolio management directly within user profile edit section with modern card-based layout
- **Admin Panel & Home Page Theming**: Consistent application of a dark gradient theme (gray-900 → blue-900 → purple-900) with glassmorphism effects and animated background orbs.
- **KYC & Verification**: Multi-tier verification system with trust scoring, including identity verification, free SMS services, and encrypted document storage.
- **Location System**: Complete authentic data for Algeria's 58 wilayas with both Latin and Arabic names (official 2024 data including 10 new provinces added in December 2019).

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/***: Accessible UI primitives.
- **react-hook-form**: Form handling and validation.
- **zod**: Schema validation.
- **tailwindcss**: Utility-first CSS framework.

### Authentication
- **passport**: Authentication middleware for Google OAuth.
- **openid-client**: OpenID Connect implementation for Replit Auth.
- **express-session**: Session management.
- **connect-pg-simple**: PostgreSQL session store.

### Other Integrations
- **Google Cloud Storage**: Used for profile picture storage and portfolio image management with object storage bucket `replit-objstore-c163bb61-ba68-4bf2-8adf-62b0128c5bfa`.
- **Google Maps JavaScript API**: Integrated for location services and interactive maps.
- **Uppy File Upload**: Advanced file upload system with dashboard modal, progress tracking, and metadata collection for portfolio galleries.