# API Services

This directory contains all the API service implementations for the application.

## Structure

- `api.ts` - Base Axios configuration and interceptors
- `auth-service.ts` - Authentication related API calls
- `index.ts` - Service exports and type definitions

## Usage

### Authentication Service

```typescript
import { authService } from '@/services';

// Teacher login
const result = await authService.teacherLogin({
  email: 'teacher@example.com',
  password: 'password123'
});

// Master admin login
const result = await authService.masterAdminLogin({
  email: 'admin@example.com',
  password: 'password123'
});

// Logout
authService.logout();
```

## Role Mapping

The API returns roles in uppercase format:
- `MASTER_ADMIN` - Maps to `admin` role in frontend
- `TEACHER` - Maps to `teacher` role in frontend

This mapping ensures consistent role handling across the application.

## Features

1. **Axios Interceptors**
   - Request interceptor for adding auth tokens
   - Response interceptor for handling common errors

2. **Error Handling**
   - Centralized error handling
   - Automatic token refresh on 401 errors

3. **Type Safety**
   - Strongly typed request/response objects
   - TypeScript interfaces for all API contracts

4. **Configuration**
   - Environment-based API URLs
   - Timeout configuration
   - Default headers