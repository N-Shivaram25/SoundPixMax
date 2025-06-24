# SoundPix - Voice to Image Converter

## Overview

SoundPix is a modern web application that transforms voice input into visual content. Users can record voice messages, have them transcribed and translated, then generate images, story sagas, or videos based on the processed text. The application supports multiple languages and provides a gallery system for organizing generated content.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Speech Recognition**: Web Speech API integration with browser compatibility checking

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Development**: Hot module replacement via Vite middleware
- **Error Handling**: Centralized error middleware with structured responses

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Centralized schema definition in `shared/schema.ts`
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Voice Processing System
- **Speech Recognition**: Browser-based Web Speech API with fallback handling
- **Language Support**: Multi-language transcription with configurable language selection
- **Real-time Feedback**: Visual indicators for recording state and audio waveforms

### Content Generation Modes
- **Image Mode**: Generate 3 images from voice input
- **Saga Mode**: Create story-based visual content
- **Video Mode**: Produce video content from voice prompts

### Gallery Management
- **Folder Organization**: User-created folders for content organization
- **Content Storage**: Generated images and videos with metadata
- **Search and Filter**: Historical prompt search functionality

### Authentication System
- **Simple Auth**: Email and username-based authentication
- **Google OAuth**: Prepared for Google authentication integration
- **Session Management**: User state persistence

## Data Flow

1. **Voice Input**: User records voice message in selected language
2. **Transcription**: Audio converted to text using Web Speech API
3. **Translation**: Text optionally translated to target language
4. **Content Generation**: Processed text sent to generation APIs
5. **Storage**: Generated content stored with associated metadata
6. **Gallery Display**: Content organized in user folders with search capabilities

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Icons**: Additional icon sets

### Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema validation

### Development Tools
- **Vite**: Build tool with HMR support
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite development server with Express middleware
- **Port Configuration**: Development server on port 5000

### Production Build
- **Build Process**: Vite builds client assets, ESBuild bundles server
- **Static Assets**: Client built to `dist/public` directory
- **Server Bundle**: Express server bundled as ES module

### Database Setup
- **Environment Variables**: `DATABASE_URL` required for PostgreSQL connection
- **Schema Deployment**: `npm run db:push` for schema updates
- **Connection Pooling**: Neon serverless connection handling

## Changelog
- June 24, 2025: Initial setup with React/TypeScript frontend and Express backend
- January 22, 2025: Added PostgreSQL database with Drizzle ORM for persistent storage
- January 22, 2025: Integrated AssemblyAI for improved voice recognition and translation
- January 22, 2025: Fixed RunwayML video generation API implementation
- January 22, 2025: Enhanced folder management with proper image assignment to "Pre Images"
- January 22, 2025: Added export functionality and fixed prompt history display
- January 22, 2025: Improved voice recognition with 5-second silence detection
- January 22, 2025: Fixed Saga mode story segmentation for multiple image generation

## Recent Issues Fixed
- Voice transcript no longer disappears after 1 second pause
- Folder creation now properly displays in folder selection modal
- Prompt history sidebar now shows thumbnails and proper sorting
- Images automatically assigned to "Pre Images" folder upon generation
- Export button added to header for project downloads
- Saga mode properly splits stories into segments for image generation
- Database integration completed with proper schema migration

## User Preferences

Preferred communication style: Simple, everyday language.
Voice recognition requirements: 5-second silence detection, multi-language support (Telugu, Hindi, English)
Image generation: Exactly 3 images for normal mode, 1 per story segment for Saga mode
Video generation: 3 videos using RunwayML API
Translation: Internal translation from source language to English for API calls