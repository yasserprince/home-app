# ServiceNow - Home Service Booking Platform

## Overview

This is a full-stack home service booking platform connecting customers with local service providers. It enables users to browse service categories, find providers, book appointments, and manage service requests via an intuitive mobile-first interface. The project aims to provide a comprehensive, modern solution for home service bookings, with a focus on user experience, professional design, and robust functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Portfolio Gallery System**: Complete multi-section photo organization system integrated into user profile editing, inspired by TaskRabbit and Thumbtack featuring:
  - **Multi-Category Galleries**: Featured Work, Before & After, Work Samples, Tools & Equipment, Certifications
  - **Object Storage Integration**: Professional file upload system with Uppy dashboard and Google Cloud Storage
  - **Advanced Photo Management**: Primary image selection, drag & drop uploads, grid/list view modes, detailed image modal
  - **Profile Integration**: Portfolio management directly within user profile edit section for streamlined workflow
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