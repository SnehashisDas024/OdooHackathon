# HRMS Frontend Build Prompt
*(Paste this whole document into Cursor / Windsurf / your AI coding tool as the frontend build spec.)*

---

## 0. What you are building

Build the complete **frontend** (`client/`) for an HRMS (Human Resource Management System) using **React 18 + Vite + Tailwind CSS**. This is a role-based web app for a company's HR operations: employee onboarding, profile management, attendance, leave/time-off, and payroll. Two roles exist — **Admin/HR Officer** and **Employee** — and almost every screen behaves differently depending on which one is logged in.

The brief below covers three things, in order:
1. **Visual direction** — the design language every page must follow.
2. **Global system** — shared components, the illustration system, and the custom loading/buffering animation (this replaces every spinner in the app).
3. **Page-by-page spec** — a detailed brief for every single page/route, written so you can build each one independently.

Do not use generic dashboard templates. Every page needs the illustration and empty-state treatment described below — this is a product people will use daily, and it should feel warm and human, not like a spreadsheet with rounded corners.

---

## 1. Visual Direction (design tokens — follow exactly)

**Concept**: "A calm, well-run office, drawn." The product should feel like a friendly office manager, not enterprise software. Clean layout, generous whitespace, soft shadows, and small flat-vector illustrated moments that make routine HR tasks (checking in, applying for leave, viewing a payslip) feel light instead of bureaucratic.

### Color palette (name every value, use these exact hexes as CSS variables)
| Token | Hex | Use |
|---|---|---|
| `--bg-canvas` | `#F6F8FC` | Page background (soft blue-white, never pure white) |
| `--bg-surface` | `#FFFFFF` | Cards, panels, modals |
| `--ink-primary` | `#1B2559` | Headings, primary text (deep navy, not black) |
| `--ink-muted` | `#6B7594` | Secondary text, labels, placeholders |
| `--brand-primary` | `#3454D1` | Primary buttons, active nav, links, focus rings |
| `--brand-primary-hover` | `#28409F` | Hover state of primary |
| `--accent-coral` | `#FF6B4A` | Secondary CTA accents, illustration highlight color, "apply leave" type actions |
| `--status-present` | `#22C55E` | Present / Approved / Checked-in |
| `--status-pending` | `#F5A623` | Pending / Absent / awaiting-action |
| `--status-leave` | `#8B5CF6` | On-leave (paired with the airplane icon) |
| `--status-danger` | `#EF4444` | Rejected, errors, destructive actions |
| `--border-hairline` | `#E3E8F4` | Card borders, dividers |

Never introduce a warm-cream + terracotta palette or a near-black + neon-green palette — those are generic AI-tool defaults and explicitly not this brief.

### Typography
- **Display / headings**: `Sora` (geometric, rounded-friendly, confident at large sizes) — weights 600/700.
- **Body**: `Inter` — weights 400/500. All form labels, paragraph text, nav items.
- **Utility / data / codes**: `IBM Plex Mono` — used only for Login IDs (e.g. `OIJODO20220001`), employee codes, PAN/UAN numbers, bank account numbers, and salary figures. This gives numeric/ID data a "systems" feel that visually separates it from prose, which matters a lot in an HR app full of IDs.

### Layout
- App shell: fixed left **sidebar** (240px, `--bg-surface`, hairline right border) + top **header** (64px) + scrollable content area on `--bg-canvas`.
- Cards use 16px corner radius, 1px `--border-hairline`, and a very soft shadow (`0 2px 8px rgba(27,37,89,0.06)`) — never harsh drop shadows.
- Content max-width 1280px, centered, with 32px page padding (16px on mobile).
- Grid-based layouts for the employee card grid (auto-fill, minmax(260px, 1fr)).

### Signature element (the one thing this app is remembered for)
**Contextual flat-vector illustrations that live inside empty states, page headers, and success moments** — never generic stock icons. Every major page gets one custom flat-vector cartoon illustration that depicts *that page's action* (e.g., a small character checking a wall clock for Attendance, a character sliding a suitcase for Leave, a character reviewing a paper with a magnifying glass for Payroll). These illustrations use only the palette above (navy line work, coral/indigo fills, soft rounded shapes, no gradients, no photorealism — think flat 2D vector, generous negative space, 2–3 colors max per illustration) and appear at:
- Empty states ("no leave requests yet" → character with an empty suitcase)
- Onboarding completion (Sign Up success → character holding a welcome sign)
- Page headers on lower-density pages (Dashboard hero corner, Payroll page top-right)
- Success confirmations (leave approved, check-in successful)

Second signature element: **the buffering/loading animation** described in Section 2.2 — a moving flat-vector SVG diagram instead of a spinner, used everywhere the app is waiting on data or network.

### Motion
- Page transitions: subtle 150ms fade + 8px slide-up on route change.
- Card hover: 2px lift + shadow deepen, 120ms ease.
- Status dot pulse: the green "checked-in" dot gets a soft 2s pulsing ring animation (like a subtle "live" indicator), not a hard blink.
- Respect `prefers-reduced-motion`: disable the pulse and slide transitions, keep fades only.

---

## 2. Global System (build these first, reuse everywhere)

### 2.1 Shared components
- `Button` — primary (filled `--brand-primary`), secondary (outline), destructive (`--status-danger`), ghost. All with a focus-visible ring.
- `Card`, `Modal`, `Input`, `Select`, `DatePicker` (wraps react-day-picker), `Tabs`, `Badge` (for status: Present/Absent/Leave/Pending/Approved/Rejected — colored per token above), `Avatar` (with fallback initials on brand-primary background if no photo), `Toast` (react-hot-toast, styled to match — rounded, soft shadow, colored left border by type).
- `EmptyState` — icon/illustration + heading + short helper line + optional CTA. Used on: no leave requests, no documents, no certifications, no employees found (search), attendance not yet checked in today.
- `StatusDot` — the three-state indicator from the SRS: green solid + pulse (present), yellow/amber solid (absent), small airplane glyph in `--status-leave` purple circle (on leave). Positioned top-right corner of employee cards, 12px diameter.

### 2.2 The Buffering/Loading System — **critical, replaces all spinners**

**Do not use a spinner, skeleton shimmer bar, or circular progress indicator anywhere in this app.** Every loading and network-wait state uses a small looping flat-vector SVG animation instead, matching the illustration style above. Build a single reusable `<BufferAnimation variant="..." />` component with these variants, each a simple looping SVG/CSS animation (2–4 seconds per loop, ease-in-out, respects reduced-motion by freezing on a static frame):

| Variant | Where used | Animation concept |
|---|---|---|
| `walking-doc` | Global route-level page loads, initial app boot | A small flat-vector character walks in place carrying a folder that gently bobs up and down; a thin dashed line "path" scrolls beneath their feet to imply motion |
| `clock-spin` | Attendance page data fetch, check-in/check-out submit | A flat clock face with hands sweeping smoothly, and a small coffee cup icon that gently rocks beside it |
| `paper-plane` | Leave apply/submit, leave list fetch | A small paper airplane flies in a slow horizontal figure-8 loop across a dashed sky line |
| `coin-stack` | Payroll page fetch, salary calculation submit | Flat-vector coins stack one-by-one in a loop, then gently reset and restack |
| `card-shuffle` | Dashboard employee grid fetch, Employee List fetch | 3 flat-vector employee card silhouettes slide/fade in a staggered loop, like cards being dealt |
| `upload-arrow` | File uploads (documents, profile picture, medical certificate) | A flat-vector cloud with an arrow rising into it repeatedly, with small dot "particles" trailing upward |

Implementation notes:
- Build these as inline SVG with CSS `@keyframes` (translate/rotate/opacity only — no filter-heavy effects, keep them lightweight).
- Each variant should render at a small inline size (e.g. 96–140px) for in-page loads, and a larger centered size (200px+) for full-page/route-level loads.
- Pair every `BufferAnimation` with a short, calm caption underneath in `--ink-muted` (e.g. "Fetching today's attendance…", "Calculating salary breakdown…") — never a bare animation with no text.
- Network error state (fetch failed) is a **separate**, still illustration, not a variant of the buffering animation: a flat-vector character shrugging next to a disconnected plug, with a "Retry" button.

---

## 3. Pages (build each of these as a route)

For every page below: build the layout, all interactive states (loading via `BufferAnimation`, empty via `EmptyState`, error, populated), and role-based behavior exactly as specified. Use React Router v6, guard admin-only routes with an `AdminRoute` wrapper.

### 3.1 Sign In — `/sign-in`
- Centered auth card on `--bg-canvas`, split layout on desktop: left half is a large flat-vector illustration (a character unlocking a door / sitting at a friendly desk with a laptop), right half is the form.
- Fields: **Login ID or Email**, **Password**, "Forgot password?" link, primary **Sign In** button.
- Incorrect credentials → inline red helper text under the password field ("That Login ID or password doesn't match our records") — never a generic toast-only error; the field itself should visibly flag.
- On submit: button shows `BufferAnimation` variant `walking-doc` at small inline size inside the button area (replacing button text momentarily) while the request is in flight.
- On success: brief full-screen `walking-doc` transition (large size, "Getting your dashboard ready…") before routing to `/dashboard`.
- First-time login (temporary password) detection: if the API flags `mustChangePassword`, redirect to a **Change Password** modal/page before dashboard access — form with New Password + Confirm Password, same validation rules as Sign Up.

### 3.2 Sign Up (Admin/HR onboarding a new employee) — `/onboarding/new-employee` (Admin/HR only, not public)
- This is **not** a public registration page — gate it behind `AdminRoute`. Frame the page heading as "Add a new employee" rather than "Sign Up."
- Fields: Name, Email, Phone, Password, Confirm Password, Upload Logo (company logo, shown as a drag-and-drop tile with the `upload-arrow` buffer variant during upload).
- Live password rules hint under the password field (length, character requirements) that ticks green per rule as satisfied — do not just show rules statically, react to typing.
- On submit success: show a full-width success panel with a flat-vector illustration (character holding a "Welcome!" sign or ID badge) plus the **auto-generated Login ID** displayed prominently in the `IBM Plex Mono` utility font inside a copyable pill/badge (e.g. `OIJODO20220001`), and the **auto-generated temporary password** shown once with a "copy" button and a note: "Share this securely with the employee — it won't be shown again."
- Include a small explainer tooltip near the Login ID: how it's constructed (OI + initials + join year + serial), so admins understand the format at a glance.

### 3.3 Dashboard — `/dashboard`
**Shared shell (all roles):**
- **Sidebar** (left, fixed): nav items — Employees, Attendance, Time Off, Settings, Log Out — each with a small flat-line icon (lucide-react), active item highlighted with a `--brand-primary` left accent bar and tinted background.
- **Header** (top): company logo + company name (left), user avatar (right) with a dropdown on click containing **My Profile** and **Log Out**.
- **Systray check-in/out widget**: small pill button in the header, shows "Check In" (green, `--status-present`) when not yet checked in today, switches to "Check Out" (outline) once checked in, with an inline timer showing elapsed time since check-in. Submitting shows `clock-spin` buffer variant inline in the button.

**Employee view:**
- Quick-access card row at the top: Profile, Attendance, Leave Requests — each a large tappable card with a small illustration icon and one-line description, not just a label.
- Below: an **Activity Feed** panel — recent alerts (leave approved/rejected, upcoming holidays, check-in reminders) as a simple timeline list, each entry with a tiny colored dot matching its status token.
- If no recent activity: `EmptyState` with a calm "All caught up" illustration (a character relaxing at a clean desk).

**Admin/HR view:**
- **Employee Card Grid**: responsive grid of clickable employee cards. Each card: avatar/photo, name, job title (small muted text), and the `StatusDot` in the top-right corner (green pulse / amber / purple airplane per the SRS rules). Clicking a card routes to that employee's profile in **view-only mode** (no edit controls rendered at all, not just disabled — a visibly different, read-only page state).
- Above the grid: a small live-count strip ("18 Present · 3 On Leave · 2 Absent today") using the three status colors as pill backgrounds.
- Search/filter bar above the grid (by name, department). Empty search results → `EmptyState` ("No employees match that search" with a character holding a magnifying glass).
- Grid loading state uses `card-shuffle` buffer variant.

### 3.4 Employee Profile — `/profile` (own) and `/employees/:id` (admin viewing another employee)
Tabbed layout (`Tabs` component): **My Profile**, **Private Info**, **Bank Details**, **Salary Info** (Salary Info tab only renders for Admin viewing any profile, or hidden entirely for an Employee viewing their own — do not just gray it out, remove it from the tab list for employees).

- **My Profile tab**: profile picture (editable only in own, editable view for admin edit mode; static in read-only mode) + Name, Mobile, Email, Department, Job Position, Manager, Company, Location, Date of Joining, Employee Code (mono font). Below: **About** section (About me / What I love about my job / My interests and hobbies — three short textareas). Below that: **Skills & Certifications** — resume attachment (upload tile with `upload-arrow` variant), skills as removable chips with an "+ Add Skill" input-on-click, and a certification list (name + issuer + small illustration badge icon per entry).
- **Private Info tab**: Date of Birth (date picker), Residing Address, Personal Email, Gender (select), Nationality, Marital Status, PAN No, UAN No, Emp Code — plain form grid, 2 columns desktop / 1 column mobile.
- **Bank Details tab**: Account Number, Bank Name, IFSC Code — treat as sensitive: mask the account number by default (••••1234) with a "show" toggle (eye icon).
- **Salary Info tab** (admin-only visibility): read-only for employee viewing this (if ever surfaced elsewhere per 3.6.1), full editable salary breakdown for admin — see Payroll page for the shared component, this tab embeds the same `PayrollView`/`PayrollEditForm` scoped to this one employee.
- Edit mode: employees see edit affordances (pencil icons) only on fields they're allowed to change per the SRS (address, phone, avatar, about text, skills). Admin viewing an employee via `/employees/:id` gets full edit affordances on every tab/field.
- View-only mode (admin clicking an employee card from the dashboard grid) renders the exact same tabs with **zero edit affordances anywhere** — every field is plainly displayed text, no input borders, no pencil icons, no save button.

### 3.5 Attendance — `/attendance`
**Employee view:**
- Top: today's check-in/out systray widget mirrored larger here (big card, current elapsed work time in large `IBM Plex Mono` digits, a small `clock-spin` illustration beside it while any attendance action is in flight).
- Below: a **day-wise grid/calendar for the ongoing month** — table or calendar-cell layout showing Date, Day, Check In, Check Out, Work Hours, Extra Hours, Breaks per row/cell. Weekend/holiday rows visually muted (lighter background, `--ink-muted` text).
- Empty/future dates (not yet occurred this month) shown as blank/greyed cells, not zeros.

**Admin/HR view:**
- Real-time "who's in today" panel: a live list/grid of all employees' current status (checked-in time, or absent/on-leave), using the same `StatusDot` system, sortable by department.
- Loading state: `clock-spin` variant.

### 3.6 Leave / Time Off — `/leave`
**Employee view:**
- **Balance summary cards** at top: Paid Time Off (24 days allocated, shows remaining/used as a small flat-vector progress ring or bar in `--brand-primary`), Sick Leave (7 days, same treatment in `--status-pending` amber), Unpaid Leave (count used, no cap, neutral gray).
- **Apply for Leave** form (modal or dedicated section): Time Off Type (select: Paid/Sick/Unpaid), From/To date fields selected directly on an inline calendar widget (not two separate plain text inputs — an actual calendar the user clicks across a range), auto-calculated **Days Count** shown live as dates are picked, Remarks textarea, and a conditional **Attachment** upload field that becomes required (with a visible "required for Sick Leave" note and red asterisk) only when Sick Leave is selected — validate this in the UI before submit.
- Submitting shows `paper-plane` buffer variant.
- **My Requests list** below: cards per request showing type, date range, days, status `Badge` (Pending amber / Approved green / Rejected red), and any admin comment if present. Empty list → `EmptyState` (character with a closed suitcase, "No time off booked yet").
- Approved leave should visually cross-reference: a small note/link "This shows as ✈️ on your dashboard card while active."

**Admin/HR view:**
- **Leave Approval Panel**: table/list of all requests across employees, filterable by status and employee, each row expandable to show remarks + attachment preview, with inline **Approve**/**Reject** buttons and a required comment field on reject (optional on approve). Bulk-select for approving multiple straightforward requests is a nice-to-have, not required.
- Approve/Reject action shows a brief inline `paper-plane` variant on the row while submitting, then the row updates status color immediately (optimistic UI is fine, reconcile on response).

### 3.7 Payroll — `/payroll` (own, read-only) and admin editable view inside Employee Detail / a dedicated `/payroll/employees/:id`
**Employee view (`PayrollView`, strictly read-only):**
- A clean payslip-style card: Monthly Wage at top in large `IBM Plex Mono`, then a breakdown table of Basic Salary, HRA, Standard Allowance, Performance Bonus, LTA, Fixed Allowance — each row with a small colored bar showing proportion of total. Below: Deductions section (PF Contribution, Professional Tax) subtracted to a **Net Payable** total, visually separated (divider + bolder row).
- No input fields render at all in this view — this is a display-only component, not a disabled form.
- Loading: `coin-stack` variant with caption "Fetching your payslip…"

**Admin view (`PayrollEditForm`):**
- A single input: **Monthly Wage**. All other fields (Basic, HRA, Standard Allowance, Performance Bonus, LTA, Fixed Allowance, PF, PT, Net Payable) are **auto-calculated and update live** as the admin types the Monthly Wage — show the math updating in real time, not just on submit (debounce ~200ms). Display the exact percentages/formulas as small muted subtext under each row (e.g. "50% of Monthly Wage" under Basic Salary) so the admin can see why each number is what it is.
- A visible balance check: sum of all components should always equal Monthly Wage — show a small green checkmark confirmation row ("✓ Components balance to Monthly Wage") since Fixed Allowance recalculates to guarantee this.
- Save button submits with `coin-stack` buffer variant; on success, toast "Salary structure updated" and the employee's read-only view reflects it.

### 3.8 Employee List — `/employees` (Admin only)
- Full list/table alternative to the dashboard grid, for bulk admin tasks: sortable columns (Name, Department, Job Position, Date of Joining, Status). Row click routes to `/employees/:id` view-only profile, same as dashboard cards.
- Includes the same search/filter bar and `card-shuffle` loading treatment as the dashboard grid.
- A prominent "+ Add Employee" button routes to the onboarding page (3.2).

### 3.9 Settings — `/settings`
- Simple sectioned page: Company details (name, logo — editable by admin only), Notification preferences (toggle list), Change Password form (reuses the live password-rules component from onboarding), and for Admin: a small "Payroll formula reference" read-only card restating the salary calculation rules from 3.6.2 for transparency.

### 3.10 404 — `*`
- Full-page flat-vector illustration (a character looking at a map upside-down, or lost with a signpost pointing every direction) with "This page took a wrong turn" heading and a button back to Dashboard. Keep it light and on-brand, not a bare "404" text page.

---

## 4. Cross-cutting requirements

- **Responsive**: sidebar collapses to a bottom tab bar or hamburger drawer below 768px; employee card grid drops to 1 column; all tables become stacked cards on mobile.
- **Accessibility**: visible keyboard focus rings using `--brand-primary`, proper label/for associations on every form field, `aria-live="polite"` region announcing buffer captions for screen readers, color is never the only status signal (pair every status color with text/icon, e.g. StatusDot always has an accessible label like "Present").
- **Reduced motion**: all `BufferAnimation` variants and the status-dot pulse must check `prefers-reduced-motion` and fall back to a static single frame + the caption text still shown.
- **Consistency of language**: buttons say what they do in plain verbs ("Check In", "Approve", "Save changes" — not "Submit"). Errors state what happened and how to fix it, never apologize, never vague ("That file's over 5MB — try a smaller one" not "Upload failed").
- **State completeness**: every page in Section 3 must be built with all four states — loading (via the matching `BufferAnimation` variant), empty (via `EmptyState` with matching illustration), error (network-error illustration + Retry), and populated.

---

*End of frontend prompt. Backend/API contract is defined separately in the HRMS system design document — build this frontend against the routes and data shapes described there (`/auth`, `/employee`, `/attendance`, `/leave`, `/payroll`).*
