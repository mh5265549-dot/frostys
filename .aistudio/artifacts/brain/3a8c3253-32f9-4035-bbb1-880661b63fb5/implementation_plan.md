# Staff Entrance & Staff Hub Integration in Admin Console

Provide an unambiguous, dedicated **Staff Entrance** button positioned prominently among the admin navigation buttons, accompanied by a direct login flow from the Admin sign-in modal that immediately navigates to the Staff Hub tab.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed preferences from Phase 1, the Staff Entrance will be integrated directly into the Admin Panel's primary navigation suite and will provide direct access to the Staff Hub upon authentication.

- **Confirmed Decision 1 (Button Location)**: The **Staff Entrance** button will be placed directly alongside the existing platform buttons in the Admin navigation sidebar (`Overview & Metrics`, `Live Orders`, `Menu & Catalog CRUD`, `Add Product`, `Financials & Costs`, `Staff Entrance`, etc.) with clear, prominent styling.
- **Confirmed Decision 2 (Login & Entry Flow)**: The Admin login modal will feature a dedicated quick-route button: *"Staff Entrance (Clock-In & Shift Attendance)"*. Entering the credentials through this path logs in and immediately activates the Staff Hub tab.
- **Responsive Availability**: On mobile and tablet screens, the Admin Panel will feature a sticky mobile tab switcher / drawer so staff members accessing the system on phones or tablets can instantly see and tap the Staff Entrance button.

---

## 1. Overview & Core Concept

* **What It Does**: Enables restaurant employees and managers at Frosty's to locate and access the **Staff Entrance** without ambiguity. Staff can log in directly into the Staff Hub, record their arrival time ("Reached at Frosty's"), access emergency contacts, and view shift rosters.
* **Target Audience**: Store managers, cashiers, kitchen staff, and scoopers on duty at Frosty's Green City branch.
* **Key Value**: Eliminates confusion around where staff sign in, gives employee attendance a first-class entrance in the Admin suite, and ensures accessibility across both desktop terminals and mobile devices.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Direct Entrance from Admin Sign-In**:
   * When opening the Admin modal from the website header or footer, staff members see the standard Admin Login card with two action options:
     * Primary: *"Unlock Operations Console"* (opens Overview tab).
     * Secondary / Staff Entrance: *"Staff Entrance & Shift Attendance"* (highlighted button that authenticates and immediately focuses the Staff Hub tab).
2. **Dedicated Sidebar Navigation**:
   * Once inside the console, the sidebar button previously labeled `User & Staff Hub` is prominently updated to **`Staff Entrance (Team & Attendance)`** with an active badge showing clock-in status.
   * Clicking this button opens the complete staff roster, employee contact cards, emergency details, and the one-click *"Record Arrival"* shift tracker.
3. **Responsive Mobile / Tablet Access**:
   * Adds a horizontal scrollable tab strip at the top of the workspace on screens smaller than `md`, ensuring all admin buttons—especially the Staff Entrance—are directly tappable on mobile devices.

### Visual Identity & Theme

* **Color Palette**: Neutral stone canvas (`#FAF8F5`) matching the Frosty's executive console aesthetic, warm amber/gold accents (`#D99B26`) and signature deep charcoal (`#1E1915`).
* **Staff Hub Accents**: Indigo/purple indicator for staff management, emerald indicators for active shift check-ins.
* **Typography**: Clean sans-serif hierarchy (`Plus Jakarta Sans`), tabular figures for timestamps (`font-mono tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

* **Decision 1: Direct Landing Tab Parameter**:
  * *Chosen Approach*: Maintain a target tab state (`targetTabAfterAuth: AdminTab`) that defaults to `'overview'`, but switches to `'users'` when clicking the Staff Entrance button on the login modal.
  * *Why*: Allows staff to go straight to shift check-in without having to hunt through the menu or analytics tabs.
* **Decision 2: Clear Labeling ("Staff Entrance")**:
  * *Chosen Approach*: Explicitly label the navigation button as **"Staff Entrance (Team & Attendance)"** rather than the generic "User & Staff Hub".
  * *Why*: Matches the user's mental model and immediate store operational terminology.
* **Decision 3: Mobile Viewport Tab Strip**:
  * *Chosen Approach*: Render an accessible horizontal tab bar on `< md` screens.
  * *Why*: The desktop sidebar was hidden on mobile screens (`hidden md:flex`), preventing mobile staff from navigating tabs.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│               Storefront Navbar / Footer               │
│         [ Admin Lock / Staff Entrance Trigger ]         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            Admin / Staff Authentication Modal          │
│   ┌────────────────────────────────────────────────┐   │
│   │  Password Input Field (Auto-focused)           │   │
│   │                                                │   │
│   │  [ Unlock Operations Console (Overview) ]      │   │
│   │  [ Staff Entrance -> Jump to Attendance Hub ]  │   │
│   └────────────────────────────────────────────────┘   │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│  Desktop Sidebar Navigation │ │  Mobile Viewport Tab Bar    │
│  • Overview & Metrics       │ │  [Overview] [Orders]        │
│  • Live Orders (KDS)        │ │  [Catalog]  [Add Product]   │
│  • Menu & Catalog CRUD      │ │  [Staff Entrance ★]         │
│  • Add Product              │ │  [Financials] [Security]    │
│  • Financials & Costs       │ └──────────────┬──────────────┘
│  • Staff Entrance ★         │                │
│  • Security Audit Logs      │                │
│  • System & Feature Flags   │                │
└──────────────┬──────────────┘                │
               │                               │
               └──────────────┬────────────────┘
                              ▼
┌────────────────────────────────────────────────────────┐
│              Staff Hub & Attendance View               │
│   • Staff Attendance & Arrival Timestamps              │
│   • 1-Click "Record Arrival" Action                    │
│   • Emergency Contact Numbers & Role Management        │
│   • Add / Edit Staff Profiles                          │
└────────────────────────────────────────────────────────┘
```

### Data Model & Handlers
* **`StaffMember`**: Array of staff profiles stored in local persistence (`frostys_staff_roster_v1`), containing `name`, `role`, `picture`, `contactNumber`, `emergencyContact`, `emergencyRelation`, and `arrivalTime`.
* **State Transition**: `handleStaffLogin` sets `isAuthenticated = true` and `activeTab = 'users'`, immediately scrolling to the attendance desk.
