# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArcoTrack is a React-based archery training application that allows users to track their training sessions, record scores, and analyze their performance over time. The app is built with modern React patterns and uses Supabase as a backend-as-a-service for authentication and data storage.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server with Vite
- `pnpm build` - Build for production (includes TypeScript compilation)
- `pnpm lint` - Run ESLint on the codebase
- `pnpm preview` - Preview production build locally

### Important Notes
- All commands automatically run `pnpm install` before execution
- Build process includes TypeScript compilation (`tsc -b`) before Vite build
- The project uses `pnpm` as the package manager

## Architecture Overview

### State Management
- **Global State**: React Context API with `ArcoTrackContext` for app-wide state
- **Authentication**: Separate `AuthContext` for user authentication state
- **Data Layer**: Custom hooks (`useTreinos`, `useAuth`, `useAutoSave`) for data management
- **Local Storage**: Auto-save functionality for training sessions to prevent data loss

### Key Components Structure
- `ArcoTrackApp.tsx` - Main app component with routing logic
- `src/contexts/` - React Context providers for global state
- `src/components/` - Screen components (Tela*) and shared UI components
- `src/hooks/` - Custom React hooks for data management
- `src/lib/` - Utility functions and Supabase client configuration

### Data Flow
1. User authentication handled by `AuthContext`
2. Training data managed through `ArcoTrackContext`
3. Database operations via `useTreinos` hook
4. Auto-save functionality prevents data loss during long training sessions

## Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase subscriptions
- **Security**: Row Level Security (RLS)

### Routing
- Custom screen-based routing via `telaAtual` state
- Navigation handled through `navegarPara()` function
- Bottom navigation component for main screens

## Design System

### Color Palette
- **Primary**: `#080706` (Modern black for text/headers)
- **Secondary**: `#FAFAFA` (Off-white for backgrounds)
- **Accent**: `#43C6AC` (Teal for CTAs and highlights)
- **Target Colors**: Official archery target colors (gold, red, blue, black, white)

### Typography
- **Font**: DM Sans (Google Fonts)
- **Weights**: Light (300), Medium (500), Bold (600)

### Mobile-First Design
- Container max-width: 430px for mobile-native experience
- Touch-friendly interactions
- Responsive design patterns

## Key Features

### Training System
- **Configuration**: Flexible training setup (series, arrows per series, distance)
- **Execution**: Interactive target with precise coordinate tracking
- **Scoring**: Automatic score calculation based on target zones
- **Auto-save**: Continuous session backup to prevent data loss

### Data Management
- **Real-time sync**: Supabase integration for live data updates
- **Offline support**: Local storage fallback for training sessions
- **Data validation**: Zod schemas for type safety

### Analytics
- **Performance tracking**: Scores, trends, and statistics
- **Self-evaluation**: Technical assessment system
- **Insights**: Automated analysis of shooting patterns

## Development Guidelines

### Code Organization
- Screen components prefixed with `Tela` (Portuguese for "Screen")
- Shared UI components in `src/components/ui/`
- Custom hooks follow `use*` naming convention
- Type definitions in `src/lib/database.types.ts`

### State Management Patterns
- Use `ArcoTrackContext` for training-related state
- Use `AuthContext` for authentication state
- Prefer custom hooks for data fetching and mutations
- Use auto-save for long-running operations

### Database Integration
- All database operations go through `useTreinos` hook
- Use TypeScript types from `database.types.ts`
- Follow Supabase RLS patterns for security

### Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Common Development Tasks

### Adding New Screens
1. Create new component in `src/components/`
2. Add routing case in `ArcoTrackApp.tsx`
3. Update navigation in `NavegacaoInferior.tsx` if needed
4. Add screen name to `telaAtual` type

### Database Schema Changes
1. Update `database.types.ts` with new types
2. Update conversion functions in `ArcoTrackContext.tsx`
3. Update database operations in `useTreinos.ts`

### Adding New Features
1. Consider mobile-first design constraints
2. Implement auto-save for data persistence
3. Add proper error handling and loading states
4. Follow existing TypeScript patterns

## Testing and Debugging

### Debug Mode
- Access `/debug` route for connection testing
- Add `?debug=true` to any URL for debug mode
- Debug info available in development builds

### Performance Considerations
- Training sessions use debounced auto-save
- Database operations are optimized for mobile networks
- Loading states prevent user confusion during operations

## Supabase Configuration

### Authentication
- Email/password authentication
- Persistent sessions with automatic refresh
- PKCE flow for security

### Database
- Row Level Security (RLS) enabled
- Real-time subscriptions for live updates
- Optimized queries for mobile performance

## Path Aliases

The project uses TypeScript path aliases:
- `@/*` maps to `./src/*`

This allows importing from `@/components/ui/button` instead of `../../../components/ui/button`.