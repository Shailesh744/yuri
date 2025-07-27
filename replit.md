# YouTube Downloader Application

## Overview

This is a full-stack YouTube video and playlist downloader application built with a modern React frontend and Express.js backend. The application allows users to input YouTube URLs, preview video/playlist information, and download content in various formats with real-time progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but schema not implemented yet)
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Validation**: Zod schemas shared between frontend and backend
- **Development**: Hot reload with Vite integration

## Key Components

### Frontend Components
1. **URL Input Component**: Handles YouTube URL validation and submission
2. **Video Preview Component**: Displays video metadata and download options
3. **Playlist Preview Component**: Shows playlist information with batch download capabilities
4. **Download Progress Component**: Real-time progress tracking with status updates
5. **Error/Loading States**: User-friendly feedback during operations

### Backend Services
1. **Route Handler**: Express routes for video info fetching and download management
2. **Storage Service**: In-memory storage for download progress tracking (can be extended to database)
3. **YouTube Integration**: Mock implementation ready for ytdl-core integration

### Shared Schema
- **Type-safe contracts**: Zod schemas for Video, Playlist, DownloadProgress, and API requests
- **Validation**: Consistent validation between frontend and backend

## Data Flow

1. **URL Submission**: User inputs YouTube URL → Frontend validates → API call to `/api/fetch-info`
2. **Info Retrieval**: Backend fetches video/playlist metadata → Returns structured data
3. **Download Initiation**: User selects format → API call to `/api/download` → Returns download ID
4. **Progress Tracking**: Frontend polls `/api/download/:id/progress` → Real-time updates
5. **Completion**: Download completes → User notification → Progress cleanup

## External Dependencies

### Core Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui customization
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for runtime type checking
- **HTTP Client**: Native fetch API with custom wrapper
- **Date Handling**: date-fns for time formatting

### Development Dependencies
- **TypeScript**: Full type safety across the stack
- **Vite**: Development server and build tool
- **Tailwind CSS**: Utility-first styling
- **PostCSS**: CSS processing

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations in `migrations/` directory

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)

### Scripts
- `npm run dev`: Development mode with hot reload
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run db:push`: Apply database schema changes

### Production Considerations
- Static file serving from `dist/public`
- Database migrations via Drizzle
- Environment variable validation on startup
- Error handling middleware for API routes

## Notable Architectural Decisions

### Database Strategy
- **Choice**: Drizzle ORM with PostgreSQL
- **Rationale**: Type-safe database operations with excellent TypeScript integration
- **Current State**: Schema defined but not fully implemented - storage uses in-memory fallback

### State Management
- **Choice**: TanStack Query over Redux/Zustand
- **Rationale**: Optimized for server state with built-in caching, background updates, and error handling
- **Benefits**: Automatic loading states, optimistic updates, and request deduplication

### Validation Strategy
- **Choice**: Shared Zod schemas between frontend and backend
- **Rationale**: Single source of truth for data validation eliminates sync issues
- **Implementation**: Schemas in `/shared` directory with TypeScript inference

### Component Architecture
- **Choice**: shadcn/ui component system
- **Rationale**: Accessible, customizable components with consistent design system
- **Benefits**: Rapid development with professional UI components

### API Integration Preparation
- **Current**: Mock YouTube data for development
- **Ready for**: ytdl-core integration for actual YouTube downloading
- **Design**: Abstracted storage interface allows easy database migration