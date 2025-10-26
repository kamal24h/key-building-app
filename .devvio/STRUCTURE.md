# BuildingHub - Property Management System

## Project Description
BuildingHub is a comprehensive property management platform for managing buildings, units, costs, and residents. It provides role-based access for admins, managers, and residents with features for cost tracking, bill generation, announcements, and real-time notifications.

## Key Features
- ✅ Email OTP authentication with role selection (admin, manager, resident)
- ✅ Role-based authorization and route protection
- ✅ Professional dashboard with real-time statistics
- ✅ Buildings management with full CRUD operations
- ✅ Units management with full CRUD operations
- ✅ Building manager assignment system
- ✅ Unit resident assignment system
- ✅ Building costs tracking and management
- ✅ Building charges configuration
- ✅ Bill generation and payment tracking
- ✅ Announcements system with priority levels and targeting
- ✅ Notifications system with real-time updates
- ✅ Notification badge indicators in sidebar and header

## Data Storage
Tables:
- buildings (f24gxm1s2pz4): Building information with manager assignments
- units (f24gxm1s2pz5): Unit details with resident assignments
- user_profiles (f24gxm1pktmo): User profile information with roles
- building_costs (f24hstw6yk1s): Building expenses and cost tracking
- building_charges (f24hstx8f7k0): Recurring charges configuration for buildings
- bills (f24hstxawxkw): Generated bills with payment tracking
- announcements (f26wla7m4wlc): System announcements with priority and targeting
- notifications (f26wla7m4wld): User notifications with read status tracking

Local: Zustand persist for authentication state

## Devv SDK Integration
Built-in: Authentication (email OTP), Table (NoSQL database for all data storage)
External: None

## Special Requirements
Three distinct user roles with different permission levels:
- Admin: Full access to all features, can manage buildings, units, managers, residents, costs, charges, bills, and announcements
- Manager: Building and unit management, cost and charge tracking, bill management, announcement creation
- Resident: View-only access to their own bills and announcements, can view notifications

Real-time notification system:
- Auto-refresh every 30 seconds
- Badge indicators showing unread count
- Notifications created automatically when announcements are published or bills are generated

## File Structure

/src
├── components/
│   ├── ui/                   # Pre-installed shadcn/ui components
│   ├── AppLayout.tsx         # Main layout with sidebar navigation, role-based menu, and notification badges
│   └── ProtectedRoute.tsx    # Route guard component for authentication and authorization
│
├── store/
│   └── auth-store.ts         # Zustand store for authentication and role management
│
├── pages/
│   ├── HomePage.tsx              # Landing page with features and CTA
│   ├── LoginPage.tsx             # Email OTP login with role selection
│   ├── DashboardPage.tsx         # Main dashboard with real-time statistics from database
│   ├── BuildingsPage.tsx         # Buildings management with full CRUD operations
│   ├── ManagersPage.tsx          # Building manager assignment system
│   ├── UnitsPage.tsx             # Units management with full CRUD operations
│   ├── ResidentsPage.tsx         # Unit resident assignment system
│   ├── CostsPage.tsx             # Building costs tracking with statistics and filtering
│   ├── BillsPage.tsx             # Bill generation and payment tracking
│   ├── ChargesPage.tsx           # Building charges configuration and management
│   ├── AnnouncementsPage.tsx     # Announcements system with priority, targeting, and auto-notification
│   ├── NotificationsPage.tsx     # Notifications system with real-time updates and read/unread tracking
│   ├── UnauthorizedPage.tsx      # Access denied page for role restrictions
│   └── NotFoundPage.tsx          # 404 error page
│
├── hooks/                    # Custom Hooks
│   ├── use-mobile.tsx        # Mobile detection Hook
│   └── use-toast.ts          # Toast notification system Hook
│
├── lib/
│   └── utils.ts              # Utility functions
│
├── App.tsx                   # Root component with complete routing structure
│                            # Includes protected routes with role-based access control
│
├── main.tsx                  # Entry file
│
└── index.css                 # Design system: Enterprise blue theme with warm accents
                             # Professional, trustworthy aesthetic for property management
