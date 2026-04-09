# ROADMAP-NAUION-TAMLXR (SPEC HOÀN CHỈNH)

> Version: 1.0 (Fixed)
> Scope: Full UI + Flow + Module mapping for Tâm Luxury App

---

# I. SYSTEM PRINCIPLE

Tâm Luxury App = Enterprise Jewelry Operating System

Core Streams:
- HÀNG → Inventory / Production
- TIỀN → Finance / Tax
- NGHĨA VỤ → Contract / Legal
- TRẠNG THÁI → Event / Audit

Mandatory Rules:
- Audit by default
- Event-driven architecture
- Ground truth = DB + Audit + Event

---

# II. UI LAYER ARCHITECTURE

## Layer 0 — Data Surface
- Dashboard data stream
- Ledger table
- Inventory table

## Layer 1 — Module View
- Each module = 1 main screen
- View types: table / kanban / timeline / form

## Layer 2 — Control Layer
- Sidebar
- Header
- Filter / Search / Action bar

## Layer 3 — Command Center
- Notification
- Alert
- Audit realtime

---

# III. ENTRY SYSTEM (AUTH)

## 1. Login Screen
- Email / Phone + Password
- OTP login
- Remember session

## 2. 2FA
- Required for sensitive roles

## 3. Password Recovery
- OTP reset flow

## 4. Session Control
- Device list
- Remote logout

## 5. Lock Screen
- Auto timeout

---

# IV. USER DOMAIN

## 1. Profile
- Avatar
- Info
- Role
- Department

## 2. Activity Log
- User actions

## 3. Task Center
- Assigned tasks

## 4. Notifications
- System alerts

## 5. Security
- Password
- 2FA
- Devices

---

# V. CORE DASHBOARD

## Screens:
- Executive Dashboard
- Production Dashboard
- Inventory Dashboard
- Finance Dashboard

---

# VI. SALES / ORDER

## Screens:
- Order List
- Order Detail
- Create Order
- Customer Profile

---

# VII. PRODUCTION

## Screens:
- Production Queue (Kanban)
- Production Detail
- Work Assignment
- Production Timeline

---

# VIII. INVENTORY

## Screens:
- Gold Pool Management
- Diamond Inventory
- Stock Movement
- WIP Tracking

---

# IX. FINANCE / TAX

## Screens:
- Ledger View
- Transaction Entry
- Costing Engine
- VAT Calculation
- Risk Monitor

---

# X. HR SYSTEM

## Screens:
- Employee List
- Employee Detail
- Recruitment
- Attendance
- Payroll
- Performance
- Department

---

# XI. CONTRACT / LEGAL

## Screens:
- Contract List
- Contract Detail
- Document Vault
- Legal Risk Monitor

---

# XII. LOGISTICS

## Screens:
- Delivery Orders
- Shipment Tracking
- Supplier Orders

---

# XIII. SYSTEM / AUDIT

## Screens:
- Event Log
- Audit Trail
- System Health

---

# XIV. SETTINGS

## Screens:
- Role / Permission (RBAC)
- System Config
- Policy Engine

---

# XV. CORE FLOW (STRICT)

Create Order
→ Order Detail
→ Production Queue
→ Production Detail
→ Inventory Update
→ Finance Entry
→ VAT Calculation
→ Audit Log

Rule:
- Must be clickable across modules
- No isolated screens

---

# XVI. COMPONENT SYSTEM

Required Components:
- Universal Table
- Kanban Board
- Timeline
- Ledger Grid
- Smart Form
- Audit Viewer

---

# XVII. BUILD ROADMAP

## Phase 1
- Dashboard
- Order
- Inventory

## Phase 2
- Production
- Finance

## Phase 3
- Tax
- Audit

## Phase 4
- HR
- Contract

---

# XVIII. FORBIDDEN

- Isolated CRUD
- Missing audit
- Broken flow

---

# XIX. REQUIRED

- Cross-module flow
- Audit by default
- Traceable data

---

# XX. FINAL STATEMENT

This SPEC ensures:
- Complete UI coverage
- Correct business logic
- Production-ready architecture

