# AI Rules for Tiger Empréstimos

## Tech Stack Overview

- **Frontend**: React 18 with TypeScript for type safety and modern component patterns
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessible, customizable UI
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming
- **State Management**: React Context API for global state (auth, roles) and local state with hooks
- **Data Fetching**: TanStack Query for server state management and Supabase client for database operations
- **Routing**: React Router DOM for client-side navigation and route protection
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Charts**: Recharts library for data visualization and analytics dashboards
- **Backend**: Supabase as BaaS with PostgreSQL database, authentication, and edge functions
- **Build Tool**: Vite for fast development and optimized production builds

## Library Usage Rules

### UI Components
- **ALWAYS** use shadcn/ui components when available (Button, Card, Input, etc.)
- **NEVER** create custom UI components that duplicate existing shadcn/ui functionality
- **USE** Radix UI primitives only when extending shadcn/ui or creating completely new components
- **PREFER** using existing component variants over custom styling

### Styling
- **ALWAYS** use Tailwind CSS classes for styling
- **NEVER** write inline styles or CSS-in-JS
- **USE** CSS variables from the design system for colors (primary, success, warning, etc.)
- **PREFER** responsive design patterns with mobile-first approach
- **USE** custom utility classes from index.css for complex animations and layouts

### State Management
- **USE** React Context for global state (auth, roles, settings)
- **USE** custom hooks for complex state logic and data fetching
- **NEVER** use external state management libraries (Redux, Zustand, etc.)
- **PREFER** local component state with useState for simple UI state

### Data Handling
- **ALWAYS** use Supabase client for database operations
- **USE** TanStack Query for caching, synchronization, and server state management
- **NEVER** fetch data directly in components without custom hooks
- **ALWAYS** handle loading and error states appropriately
- **USE** TypeScript interfaces for all data types

### Forms
- **ALWAYS** use React Hook Form for form management
- **USE** Zod schemas for validation and type safety
- **PREFER** controlled components over uncontrolled
- **ALWAYS** handle form submission with proper error handling

### Icons
- **ALWAYS** use Lucide React icons
- **NEVER** use other icon libraries or custom SVGs
- **PREFER** semantic icons that match the action/content

### Routing
- **ALWAYS** use React Router DOM for navigation
- **USE** route protection patterns for authenticated areas
- **NEVER** use direct window.location or anchor links for internal navigation
- **PREFER** programmatic navigation with useNavigate

### Authentication
- **ALWAYS** use Supabase Auth for authentication
- **USE** the AuthContext for auth state management
- **NEVER** implement custom authentication logic
- **ALWAYS** handle auth state changes with proper side effects

### Database Operations
- **ALWAYS** use Supabase client for database queries
- **USE** TypeScript types generated from Supabase schema
- **NEVER** write raw SQL queries in the frontend
- **PREFER** optimistic updates for better UX
- **ALWAYS** implement proper error handling for database operations

### File Structure
- **PLACE** all pages in `src/pages/` directory
- **PLACE** all components in `src/components/` directory
- **USE** subdirectories for organization (ui, auth, layout, views, etc.)
- **NEVER** place components directly in src/ directory
- **PREFER** index files for clean imports

### Code Quality
- **ALWAYS** use TypeScript with strict mode enabled
- **NEVER** use `any` type - prefer unknown or proper interfaces
- **USE** ESLint and Prettier for code formatting
- **PREFER** functional components with hooks over class components
- **ALWAYS** handle async operations properly with try/catch or error boundaries

### Performance
- **USE** React.memo for expensive components
- **PREFER** useCallback and useMemo for expensive computations
- **NEVER** create functions inside render without memoization
- **USE** lazy loading for large components or routes
- **ALWAYS** optimize re-renders with proper dependency arrays

### Mobile Responsiveness
- **ALWAYS** design mobile-first
- **USE** responsive Tailwind classes (sm:, md:, lg:)
- **PREFER** touch-friendly targets (min 44px)
- **NEVER** use fixed widths that break on mobile
- **USE** the useIsMobile hook for conditional rendering

### Accessibility
- **ALWAYS** use semantic HTML elements
- **USE** ARIA labels when necessary
- **PREFER** keyboard navigation support
- **NEVER** rely solely on color for information
- **USE** proper heading hierarchy and focus management

## Development Rules

### Before Making Changes
1. **CHECK** if the feature already exists in the codebase
2. **SEARCH** for existing components that can be reused
3. **REVIEW** the current implementation patterns
4. **CONSIDER** the impact on mobile responsiveness

### When Adding Features
1. **CREATE** new components in appropriate directories
2. **USE** existing design patterns and conventions
3. **IMPLEMENT** proper TypeScript types
4. **ADD** error handling and loading states
5. **TEST** on both mobile and desktop

### When Modifying Code
1. **MAINTAIN** existing functionality
2. **PRESERVE** the current design system
3. **UPDATE** related components if necessary
4. **FOLLOW** the established patterns
5. **DOCUMENT** significant changes

## Prohibited Actions
- **NEVER** install additional UI libraries (Material-UI, Ant Design, etc.)
- **NEVER** use CSS-in-JS libraries (styled-components, emotion, etc.)
- **NEVER** implement custom authentication systems
- **NEVER** use external state management libraries
- **NEVER** write backend code in the frontend (except Supabase edge functions)
- **NEVER** use deprecated React patterns (class components, componentWillMount, etc.)
- **NEVER** ignore TypeScript errors or use `any` type
- **NEVER** commit code without proper error handling

## Best Practices
- **ALWAYS** write clean, readable, and maintainable code
- **USE** descriptive variable and function names
- **KEEP** components small and focused (under 100 lines when possible)
- **IMPLEMENT** proper loading and error states
- **FOLLOW** the established naming conventions
- **USE** proper TypeScript interfaces for all data structures
- **TEST** thoroughly before considering a feature complete
- **DOCUMENT** complex logic with comments when necessary

This system is a professional loan management platform - maintain high code quality standards and follow established patterns consistently.