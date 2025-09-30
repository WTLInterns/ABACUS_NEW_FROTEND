# Abacus - Material Kit React

A professional dashboard application built with Next.js 15, TypeScript, and Material UI.

### Pages

- [Dashboard](https://material-kit-react.abacus.io)
- [Customers](https://material-kit-react.abacus.io/dashboard/customers)
- [Integrations](https://material-kit-react.abacus.io/dashboard/integrations)
- [Settings](https://material-kit-react.abacus.io/dashboard/settings)
- [Account](https://material-kit-react.abacus.io/dashboard/account)
- [Sign In](https://material-kit-react.abacus.io/auth/sign-in)
- [Sign Up](https://material-kit-react.abacus.io/auth/sign-up)
- [Reset Password](https://material-kit-react.abacus.io/auth/reset-password)

## Technology Stack

This project is built using modern web technologies:

### Core Framework
- **Next.js 15** - React framework for production with App Router
- **React 19** - Latest version of the popular UI library
- **TypeScript** - Typed superset of JavaScript for enhanced developer experience

### UI Components & Styling
- **Material UI 7** - Comprehensive component library implementing Material Design
- **Emotion** - CSS-in-JS library for styling components
- **@fontsource** - Self-hosted open source fonts

### Data Visualization
- **ApexCharts** - Modern charting library
- **react-apexcharts** - React wrapper for ApexCharts

### Form Handling
- **React Hook Form** - Performant, flexible forms with easy validation
- **Zod** - TypeScript-first schema declaration and validation library

### Icons
- **Phosphor Icons** - Clean and versatile icon family

### Utilities
- **Day.js** - Fast 2kB alternative to Moment.js with the same modern API

### Development & Testing Tools
- **ESLint** - Pluggable JavaScript linter
- **Prettier** - Opinionated code formatter
- **Jest** - Delightful JavaScript testing framework
- **Testing Library** - Simple and complete testing utilities

## Key Features

- Responsive dashboard layout with navigation
- Authentication system (sign in, sign up, password reset)
- Customer management
- Integration cards
- Account settings
- Dark/light mode support
- Form validation with Zod schemas
- Data visualization with charts
- Context-based state management
- TypeScript type safety throughout

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and layouts
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   └── ...
├── components/         # Reusable UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and libraries
├── styles/             # Theme and global styles
└── types/              # TypeScript type definitions
```

## License

This project is licensed under the MIT License.