# Abacus Education Management System

A comprehensive education management system built with Next.js 15, React 19, and Material UI 7.

## Tech Stack

- **Frontend Framework**: Next.js 15 with App Router
- **UI Library**: Material UI 7 with Emotion
- **Language**: TypeScript
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Phosphor Icons
- **Styling**: Emotion CSS-in-JS

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and modules
├── services/            # API service layer (Axios)
├── theme/               # Material UI theme configuration
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## API Services Layer

The application uses a professional API service layer built with Axios for all HTTP requests. This provides:

- Centralized API configuration
- Request/response interceptors
- Consistent error handling
- Type-safe API contracts
- Easy mocking for testing

Services are organized by domain:
- `auth-service.ts` - Authentication related APIs
- `api.ts` - Base Axios configuration

### Role Mapping

The API returns roles in uppercase format which are mapped to frontend roles:
- `MASTER_ADMIN` → `admin` role
- `TEACHER` → `teacher` role

## Authentication

The system supports three user roles:
1. **Teacher** - Basic educational functionality
2. **Admin** - Management of teachers and students (includes MASTER_ADMIN from API)
3. **Master Admin** - Special authentication path but maps to Admin role

## Key Features

- Role-based navigation
- Responsive dashboard layout
- Dark/light theme support
- Form validation with Zod
- Notification system
- Confirmation dialogs
- Dummy data for demonstration

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```