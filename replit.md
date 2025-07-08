# FitlyAI - AI-Powered Fitness Coach Platform

## Overview
FitlyAI is a comprehensive fitness coaching platform that combines AI-powered chat functionality with subscription-based access controls. The application provides personalized workout plans, nutrition guidance, macro tracking, and 24/7 health support through an intelligent chat interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: React Query for server state, React hooks for local state
- **Build System**: Vite with custom configuration for Replit environment

### Backend Architecture
- **Runtime**: Node.js with TypeScript and ES modules
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Supabase Auth for user management and session handling
- **Real-time Features**: Planned WebSocket integration for chat

### Database Design
- **Primary Database**: PostgreSQL via Neon (serverless)
- **Schema Management**: Drizzle Kit for migrations and schema versioning
- **Authentication Database**: Supabase (separate from main application data)

## Key Components

### Authentication & Authorization
- **Provider**: Supabase Auth with custom user profiles
- **Email Verification**: Custom token-based verification system using Resend
- **Session Management**: JWT tokens with server-side validation
- **User Profiles**: Extended profile system with subscription tiers and verification status

### AI Chat System
- **AI Provider**: OpenAI GPT models for conversational AI
- **Persona**: "FitlyAI" - specialized fitness and health coach
- **Content Filtering**: Built-in topic restrictions (only health/fitness/nutrition)
- **Features**: Text and voice input (speech-to-text), conversation history, message persistence

### Subscription Management
- **Payment Processing**: Stripe for subscription billing
- **Plans**: Free (limited), Premium ($15/month), Pro ($29/month)
- **Access Control**: Message limits and feature gating based on subscription tier
- **Webhook Integration**: Stripe webhooks for real-time subscription updates

### Fitness Tracking Features
- **Goal Setting**: User fitness goals with targets and timelines
- **Macro Tracking**: Daily calorie and macronutrient monitoring
- **Meal Plans**: AI-generated weekly meal planning
- **Workout Plans**: Personalized exercise routines
- **Progress Tracking**: Weight, body fat, and achievement monitoring

### Email System
- **Provider**: Resend with verified domain (fitlyai.com)
- **Templates**: Professional HTML templates for verification emails
- **Features**: Account verification, password reset, subscription notifications

## Data Flow

### User Registration Flow
1. User submits registration form
2. Supabase creates auth user
3. Custom user profile created in main database
4. Email verification token generated
5. Verification email sent via Resend
6. User clicks email link to verify account
7. Account activated and user can access platform

### Chat Interaction Flow
1. User authentication validated
2. Subscription status checked
3. Message limits verified (if applicable)
4. User input processed and filtered
5. AI prompt constructed with safety guidelines
6. OpenAI API called for response
7. Response filtered and returned
8. Conversation saved to database

### Subscription Upgrade Flow
1. User selects plan from pricing modal
2. Stripe Checkout session created
3. User completes payment
4. Stripe webhook updates user status
5. Access permissions automatically updated
6. User gains immediate access to premium features

## External Dependencies

### Core Services
- **Supabase**: Authentication, user management, real-time features
- **Neon**: PostgreSQL database hosting
- **OpenAI**: GPT models for AI chat functionality
- **Stripe**: Payment processing and subscription management
- **Resend**: Transactional email delivery

### Development Tools
- **Drizzle**: Database ORM and migration tool
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code formatting and linting

### UI/UX Libraries
- **shadcn/ui**: React component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Hook Form**: Form handling and validation

## Deployment Strategy

### Environment Configuration
- **Development**: Local Replit environment with environment variables
- **Production**: Replit deployment with secure secrets management
- **Database**: Neon serverless PostgreSQL for scalability
- **CDN**: Vite build output served via Express static middleware

### Environment Variables Required
- `DATABASE_URL`: Neon PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side Supabase key
- `OPENAI_API_KEY`: OpenAI API access key
- `STRIPE_SECRET_KEY`: Stripe payment processing key
- `RESEND_API_KEY`: Email service API key

### Security Considerations
- Row Level Security (RLS) enabled on all database tables
- Email verification required before platform access
- Subscription verification on protected endpoints
- Content filtering to prevent misuse of AI features
- HTTPS required for all production traffic

## Changelog
```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```