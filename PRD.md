# Fels-Servicebetrieb Planning & Scheduling Application

A comprehensive scheduling and appointment management system for Fels-Servicebetrieb, enabling service teams to manage appointments, locations, and assignments through an intuitive calendar interface.

**Experience Qualities**:
1. **Professional** - Clean, business-focused interface that instills confidence and trust
2. **Efficient** - Quick navigation and data entry with minimal clicks for busy field service teams
3. **Clear** - Information hierarchy that makes appointments, locations, and assignments immediately scannable

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This application requires authentication, multi-view calendar functionality (day/week/month/year), appointment management with detailed metadata (location, customer, workers), and persistent data storage for multiple users and their schedules.

## Essential Features

### 1. User Authentication
- **Functionality**: Secure login with username and password validation
- **Purpose**: Protect company scheduling data and enable user-specific views
- **Trigger**: User visits the application
- **Progression**: Landing on login screen → Enter credentials → Validate against stored users → Redirect to home/calendar
- **Success criteria**: Only valid users can access the system, credentials persist securely, invalid attempts show clear error messages

### 2. Navigation System
- **Functionality**: Main navigation bar with Home, Planung, and Mitarbeiter sections
- **Purpose**: Organize application into logical sections for different workflows
- **Trigger**: User clicks navigation buttons
- **Progression**: Click navigation item → Active state updates → Page content switches → Context preserved
- **Success criteria**: Navigation is instant, active page clearly indicated, no data loss when switching pages

### 3. Home Dashboard
- **Functionality**: Overview page showing key statistics and today's appointments
- **Purpose**: Give users immediate insight into current workload and upcoming tasks
- **Trigger**: Login or click Home navigation
- **Progression**: Page loads → Statistics calculate → Today's and upcoming appointments display
- **Success criteria**: Statistics are accurate, appointments update in real-time, cards are scannable

### 4. User Management (Mitarbeiter Page)
- **Functionality**: Dedicated page for creating, editing, and deleting user accounts with role assignment (Administrator or Mitarbeiter)
- **Purpose**: Centralized employee management with full CRUD operations and role-based access control
- **Trigger**: Click Mitarbeiter navigation
- **Progression**: Page loads → Shows all users with roles → Can add/edit/delete → Role selection via dropdown → Changes persist to database
- **Success criteria**: All changes save immediately, no duplicate usernames, deletions require confirmation, roles are clearly displayed and editable

### 5. Calendar Views (Day/Week/Month/Year)
- **Functionality**: Switch between different time scales to view appointments
- **Purpose**: Enable planning at different granularities (tactical daily view vs strategic monthly planning)
- **Trigger**: User clicks view toggle buttons (Tag/Woche/Monat/Jahr) in Planung section
- **Progression**: Select view type → Calendar re-renders with appropriate time scale → Appointments displayed in context
- **Success criteria**: All views render quickly (<200ms), appointments are correctly positioned, navigation between dates is smooth

### 6. Appointment Management
- **Functionality**: Create, view, edit, and delete appointments with locations, customers, and worker assignments
- **Purpose**: Core business function - tracking where workers need to be and for which customers
- **Trigger**: Click on calendar slot or existing appointment
- **Progression**: Click time slot → Dialog opens → Fill in details (Wann/Wo/Was/Wer/Womit) → Save → Appointment appears on calendar
- **Success criteria**: Appointments save reliably, display color-coded locations, show all relevant details on click

### 7. Appointment Details Panel
- **Functionality**: Side panel showing appointment details (When/Where/What/Who/With what)
- **Purpose**: Quick reference for appointment information without opening full edit dialog
- **Trigger**: Click on any appointment in calendar
- **Progression**: Click appointment → Panel updates → Shows location, customer, workers, vehicle/equipment → Can click to edit or view details
- **Success criteria**: Panel updates instantly, all information clearly organized, actions are obvious

### 8. Date Navigation
- **Functionality**: Navigate forward/backward through time periods
- **Purpose**: Browse past and future schedules
- **Trigger**: Click previous/next arrows or "Heute" (Today) button
- **Progression**: Click navigation → Calendar updates to new time period → Current date highlighted
- **Success criteria**: Navigation is instantaneous, current date/period always clearly indicated

## Edge Case Handling

- **No appointments**: Show empty calendar with helpful prompt to add first appointment
- **Empty home dashboard**: Show zeros in statistics cards, helpful messages in appointment lists
- **No users in system**: Mitarbeiter page shows empty state with prompt to create first user
- **Existing users without role**: Default to "Mitarbeiter" role for backwards compatibility
- **Overlapping appointments**: Stack visually or show side-by-side with visual indicators
- **Invalid credentials**: Clear error message without revealing whether username or password was wrong (security)
- **Long appointment names**: Truncate with ellipsis, show full text on hover
- **Past dates**: Allow viewing but potentially disable editing (or show with different styling)
- **Multiple workers per appointment**: Display as comma-separated list or pills/badges
- **No internet/data loss**: All data persists locally using KV store
- **Navigation state preservation**: When switching between pages, maintain calendar date and view settings
- **Deleting logged-in user**: Prevent deletion or log out and show warning

## Design Direction

The design should evoke **trust, efficiency, and German engineering precision**. Think of tools that professionals rely on daily - they should be robust, clear, and eliminate any friction. The interface should feel like a well-organized workshop where everything has its place. Color coding serves a functional purpose (distinguishing locations/projects), not decoration.

## Color Selection

A professional, high-contrast palette inspired by industrial and service industries with functional color coding.

- **Primary Color**: Deep Blue (`oklch(0.35 0.15 250)`) - Conveys trust, reliability, and professionalism
- **Secondary Colors**: 
  - Warm Gray (`oklch(0.55 0.02 60)`) for secondary actions and backgrounds
  - Steel Blue (`oklch(0.45 0.10 240)`) for hover states and secondary emphasis
- **Accent Color**: Vibrant Orange (`oklch(0.65 0.18 40)`) - Calls attention for primary actions like "Aktualisieren" and "Notfall"
- **Location Colors**: Diverse vibrant palette for appointment color coding (red, green, blue, orange, purple, brown, cyan, magenta, yellow)
- **Foreground/Background Pairings**:
  - Primary Blue on White (`oklch(1 0 0)`): White text - Ratio 8.2:1 ✓
  - Accent Orange on White: Dark text (`oklch(0.2 0 0)`) - Ratio 12.1:1 ✓
  - Body text (`oklch(0.2 0.01 250)`) on White background - Ratio 11.8:1 ✓
  - Muted text (`oklch(0.5 0.01 250)`) on White - Ratio 4.9:1 ✓

## Font Selection

A clean, highly legible sans-serif that maintains readability across different appointment densities and view scales, with German character support.

- **Primary Font**: Inter - Modern, professional, excellent at small sizes
- **Monospace**: JetBrains Mono for time stamps and IDs

**Typographic Hierarchy**:
- H1 (Welcome message): Inter SemiBold / 32px / -0.02em letter spacing
- H2 (Month/Year heading): Inter SemiBold / 24px / -0.01em letter spacing
- Calendar day numbers: Inter Medium / 14px / tight leading
- Appointment labels: Inter Medium / 13px / line-clamp-2 for truncation
- Body text: Inter Regular / 14px / 1.5 line height
- Small labels (panel headings): Inter Medium / 12px / uppercase / tracking-wide

## Animations

Animations should feel snappy and purposeful, never delaying user actions. They guide attention and provide feedback without being decorative.

- **View transitions**: 200ms ease-out fade + slight scale (0.98 → 1.0) when switching calendar views
- **Appointment hover**: 150ms scale (1.0 → 1.02) with subtle shadow increase
- **Panel slide**: 250ms ease-out from right when showing appointment details
- **Button feedback**: 100ms scale down on click, 200ms color transition on hover
- **Date navigation**: 300ms slide animation (left/right) when changing time periods
- **Loading states**: Subtle skeleton screens for calendar grid, no spinners

## Component Selection

**Components**:
- **Button** (primary actions like "Aktualisieren", "Anschauen", view toggles)
- **Input** (username, password, appointment fields)
- **Label** (form labels in dialogs)
- **Dialog** (creating/editing appointments)
- **Card** (appointment detail panel, calendar day cells)
- **Badge** (worker assignments, status indicators, user roles - Administrator shown with default variant, Mitarbeiter with secondary variant)
- **Select** (dropdown for worker assignment, location selection, role selection)
- **Separator** (dividing sections in detail panel)
- **Calendar** (base for building custom calendar views - adapt radix-ui)
- **Textarea** (notes/description fields in appointments)
- **Scroll Area** (for long appointment lists in day view)

**Customizations**:
- **Custom Calendar Grid**: Build on Card components with CSS Grid for month view, flexbox for week/day
- **Color-coded Appointment Blocks**: Custom component with dynamic background colors based on location
- **Time Ruler**: Custom component for day/week views showing hourly divisions
- **Multi-view Toggle**: Custom button group for Tag/Woche/Monat/Jahr with active state

**States**:
- Buttons: Distinct active state for selected view (Tag/Woche/Monat/Jahr with solid background)
- Appointments: Hover shows slightly elevated shadow, click shows selection ring
- Calendar cells: Hover shows subtle background, today gets accent border
- Inputs: Focus shows blue ring, error shows red ring with message

**Icon Selection**:
- House (home/dashboard)
- Calendar (planung/calendar mode)
- Users (mitarbeiter/user management)
- ArrowLeft, ArrowRight (date navigation)
- CalendarBlank (calendar mode icon)
- Plus (add appointment)
- UserCircle (login, worker assignment)
- MapPin (location indicator)
- Wrench (equipment/tools)
- Clock (time indicator)
- SignOut (logout)
- ArrowsClockwise (refresh/aktualisieren)
- ChartBar (statistics on dashboard)
- ClipboardText (appointments list)

**Spacing**:
- Calendar grid gaps: gap-1 (4px) for tight appointment packing
- Card padding: p-4 for appointment details panel
- Form fields: space-y-4 for clear form structure
- Button groups: gap-2 for view toggles
- Page margins: px-6 py-4 for comfortable breathing room

**Mobile**:
- Month view switches to vertical scrolling list of days
- Week view shows 3 days at a time with horizontal scroll
- Detail panel slides up from bottom instead of side
- View toggles collapse to dropdown select on small screens
- Navigation header becomes sticky with reduced padding
- Touch targets minimum 44x44px for all interactive elements
