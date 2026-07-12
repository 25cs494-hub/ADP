# TransitOps – Smart Transport Operations Platform

TransitOps is a modern, enterprise-grade SaaS web application for transport operations management. It features a comprehensive dashboard, Role-Based Access Control (RBAC), vehicle and driver management, trip dispatching, maintenance tracking, and advanced analytics.

## User Review Required

> [!WARNING]
> This is a large-scale application. Building it from scratch in a single go will be complex. I propose we build this in structured phases to ensure high quality and correct implementation of all business rules. Please review the phases below.

> [!IMPORTANT]
> The application will be scaffolded using **Vite + React + TypeScript**. We will use `shadcn/ui` for the component library, `Tailwind CSS` for styling, `Framer Motion` for animations, and `Recharts` for analytics.

## Open Questions

> [!IMPORTANT]
> 1. **Data Persistence**: Since this is a frontend-heavy request, should the mock data be persisted in `localStorage` to simulate a real database across page reloads, or should it just be held in memory (React state) which will reset on refresh?
> 2. **Authentication**: For the mockup authentication, should I implement a simulated login flow that checks against a hardcoded list of users (to demonstrate the 4 roles: Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)?

## Proposed Architecture and Stack

*   **Framework**: React 18 with TypeScript, initialized via Vite.
*   **Routing**: React Router DOM (v6).
*   **State Management**: Zustand (for global state like Auth, Users, and core business data) + React Context if necessary.
*   **UI Components**: `shadcn/ui` (Radix UI primitives + Tailwind CSS).
*   **Styling**: Tailwind CSS with custom theme configuration for a premium look (slate/indigo/emerald palette, glassmorphism utilities).
*   **Forms**: React Hook Form with Zod for validation.
*   **Charts**: Recharts.
*   **Icons**: Lucide React.
*   **Animations**: Framer Motion.

## Implementation Phases

### Phase 1: Foundation and Authentication
1. Initialize Vite React TypeScript project in `d:/Transit`.
2. Setup Tailwind CSS, shadcn/ui, and basic project structure.
3. Configure routing (Public routes, Protected routes).
4. Implement Authentication Flow (Login Page) and simulated Auth Provider.
5. Setup global state for mock data (Vehicles, Drivers, Trips).

### Phase 2: Layout and Core Dashboard
1. Build the App Shell (Sidebar, Top Navigation).
2. Implement Theme toggle (Dark/Light mode).
3. Create the Main Analytics Dashboard with Recharts and KPI cards.
4. Implement Role-Based Access Control (RBAC) to show/hide specific sidebar items and widgets based on the logged-in user.

### Phase 3: Entity Management (Vehicles & Drivers)
1. Build Vehicle Management page (Data table, Search, Filters, CRUD forms, Detail Drawer).
2. Build Driver Management page (Data table, Search, Filters, CRUD forms).
3. Enforce business rules in the forms (e.g., unique registration numbers).

### Phase 4: Operations (Trips & Maintenance)
1. Build the Multi-step Trip Wizard (Create Trip).
2. Implement complex business logic during dispatch (Driver/Vehicle availability checks, weight capacity checks, status updates).
3. Build the Maintenance workflow (Open/Close maintenance, vehicle status toggles).

### Phase 5: Finance and Analytics
1. Implement Fuel Logs and Expenses management.
2. Build the detailed Analytics and Reports pages.
3. Polish the UI (animations, glassmorphism, responsive adjustments).

## Verification Plan

### Automated/Tool Verification
- Verify successful Vite build and dependency installation.
- Check TypeScript compilation for type errors.
- Ensure all shadcn/ui components are correctly installed and styled.

### Manual Verification
- Test the login flow with different roles.
- Verify the layout responsiveness on different screen sizes.
- Execute CRUD operations for Vehicles and Drivers.
- Test the Trip Dispatch wizard, specifically triggering all business rule constraints (e.g., trying to assign an unavailable driver).
- Verify state transitions (e.g., completing a trip makes the vehicle available again).
