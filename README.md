# FreshCart – Enterprise Online Grocery Shopping & Management System

> **Tagline:** *Fresh Groceries, Fresh Happiness.*  
> **Architecture:** Modern 3-Portal Enterprise Web Application with Dual-Mode Database (Supabase PostgreSQL + High-Fidelity Local Persistence).  
> **Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Supabase SDK & PostgreSQL. (Zero frameworks: No React, Vue, Bootstrap, or Tailwind).

---

## 1. Executive Summary

**FreshCart** is a comprehensive, production-grade online grocery supermarket platform and fulfillment management system. Unlike conventional e-commerce demos with static buttons, FreshCart connects three independent portals through a unified data model:

1. **Customer Portal:** Modern online shopping, real-time inventory checks, wishlist, delivery date & slot capacity reservation, simulated online payment & Cash on Delivery (COD), live 6-stage order tracking stepper, customer-facing delivery OTP, automatic GST-compliant invoice generation, and return/cancellation requests.
2. **Shop Worker Portal:** Dedicated fulfillment station for warehouse & store staff: order acceptance, interactive item-by-item packing checklists, product defect reporting with owner substitution requests, doorstep delivery dispatch, 6-digit delivery OTP verification, cash collection logging, and shift attendance punch (check-in/check-out with digital clock).
3. **Shop Owner Admin Portal:** Executive dashboard with audited P&L accounting (Net Sales, Cost of Goods Sold [COGS], Gross Profit, Operating Overheads, and Net Profit), order dispatch with worker assignment, employee account provisioning, product catalog management, physical stock inventory with movement audit logs, supplier master, inward purchase orders, employee attendance logs, operating expenses, and return/cancellation claim approvals.

---

## 2. Technology Stack & Design System

| Layer | Technologies Used | Notes |
|---|---|---|
| **Frontend Core** | HTML5, CSS3, Vanilla JavaScript (ES6+) | Separate HTML, CSS, and JS files; zero frontend frameworks |
| **Icons & Typography** | Font Awesome 6.5.1, Google Poppins Font | Modern, readable sans-serif typography |
| **Backend & Database** | Supabase (PostgreSQL 15), Supabase Auth, Storage, Edge Functions | Standardized SQL migrations & server-side Edge Functions |
| **Dual-Mode Adapter** | LocalStorage DB Emulator & Supabase SDK Adapter | Allows 100% full offline testing without crashing if cloud keys are absent |
| **Color Palette** | **Forest Green:** `#1B5E35` \| **Fresh Green:** `#4CAF50` \| **Lime Green:** `#A5D66A` \| **Warm Cream:** `#F8F8F0` \| **Card White:** `#FFFFFF` \| **Dark Charcoal:** `#252525` |

---

## 3. System Architecture & 3-Portal Workflow

```
[CUSTOMER PORTAL]
  │
  ├─► Browses 42+ Products across 11 Categories
  ├─► Adds to Wishlist / Cart with stock boundary checks
  ├─► Selects Delivery Date & Capacity-Limited Time Slot
  ├─► Selects COD or Online Demo Payment (UPI / Card simulation)
  ├─► Order Created (Deducts Physical Stock & Generates 6-Digit Doorstep OTP)
  │
  ▼
[OWNER PORTAL]
  │
  ├─► Receives New Order Notification on Admin Dashboard
  ├─► Confirms Order and Assigns Fulfillment Worker (Sets Prep Deadline)
  │
  ▼
[WORKER FULFILLMENT STATION]
  │
  ├─► Receives Assigned Task in "My Assigned Orders"
  ├─► Checks in Attendance & toggles status to "BUSY"
  ├─► Uses Interactive Packing Checklist (item-by-item verification)
  ├─► Flags Damaged/Missing items & proposes substitutions to Owner
  ├─► Marks "Packed & Sealed"
  ├─► Dispatches "Out for Delivery"
  │
  ▼
[CUSTOMER DOORSTEP HANDOVER]
  │
  ├─► Customer provides 6-digit OTP displayed on their Live Tracking page
  ├─► Worker inputs OTP into verification interface (Max 5 attempts)
  ├─► If COD: Worker confirms physical cash collected
  ├─► Order status transitions to "DELIVERED" (Delivered timestamp logged)
  │
  ▼
[CUSTOMER POST-DELIVERY]
  │
  ├─► Downloads / Prints GST-compliant Tax Invoice
  └─► Submits Return Claim if defect found (Owner approves & triggers restock)
```

---

## 4. Pre-Seeded Demonstration Credentials

FreshCart includes pre-provisioned demo accounts across all three roles for instant, seamless testing:

| Portal | Role | Email | Password | Pre-loaded Profile / Responsibilities |
|---|---|---|---|---|
| **Customer Portal** | Customer | `customer@freshcart.com` | `customer123` | **Ananya Sharma** – Regular grocery shopper in HSR Layout, Bengaluru; 3 past orders pre-loaded. |
| **Worker Portal** | Fulfillment Staff | `worker@freshcart.com` | `worker123` | **Suresh Kumar (EMP-101)** – Fulfillment Specialist; assigned active orders & packing queue. |
| **Owner Admin** | Store Owner | `owner@freshcart.com` | `owner123` | **Rajesh Varma** – General Manager; full executive P&L, employee provisioning & inventory controls. |

*Note: Self-registration for new customers is supported via `customer-register.html`. Additional worker accounts can be provisioned by the owner from `manage-employees.html`.*

---

## 5. Directory & File Structure

```
FreshCart/
│
├── index.html                   # Redesigned Modern Supermarket Homepage
├── about.html                   # Store Story, Organic Commitment & Team
├── products.html                # Complete 42-Item Grocery Catalog & Filters
├── product-details.html         # Item Showcase, Nutrition, Origin & Stock
├── cart.html                    # Shopping Cart, Stock Bounds & Promo Codes
├── wishlist.html                # Saved Favorites with Move-to-Cart Feature
├── checkout.html                # Slot Scheduling, COD & Demo Online Payment
├── contact.html                 # Store Location, Business Hours & Form
├── invoice.html                 # GST Tax Invoice View & Print Layout
│
├── customer-login.html          # Customer Portal Authentication
├── customer-register.html       # Customer Self-Registration & Real-Time Validation
├── customer-dashboard.html      # Customer Account Metrics, Quick Tracking
├── my-orders.html               # Full Customer Order History & Invoices
├── order-tracking.html          # 6-Stage Visual Stepper & Customer OTP Box
├── return-requests.html         # Customer Cancellation & Return Request Form
├── profile.html                 # Customer Saved Addresses & Contact Info
│
├── worker-login.html            # Fulfillment Staff Sign In
├── worker-dashboard.html        # Worker Dashboard, Availability & Punch Clock
├── worker-orders.html           # Staff-Specific Assigned Orders List
├── packing-tasks.html           # Interactive Checklist & Substitution Reporting
├── delivery-tasks.html          # Doorstep Dispatch & 6-Digit OTP Verification
├── worker-attendance.html       # Shift Punch-In/Out & Shift Hours Log Table
│
├── owner-login.html             # Administrative Master Login
├── owner-dashboard.html         # Executive Financial KPIs & Dispatch Queue
├── manage-orders.html           # Full Orders Console & Staff Assignment
├── manage-employees.html        # Worker Account Provisioning & Activation
├── manage-products.html         # Add, Edit & Delete Grocery Catalog Items
├── inventory.html               # Stock Levels & Movement Audit Trail
├── suppliers.html               # Supplier Master & Agricultural Co-ops
├── purchases.html               # Inward Consignments & Automatic Restocking
├── attendance.html              # Employee Shift Attendance Reports
├── expenses.html                # Store Overheads (Rent, Electricity, Wages)
├── reports.html                 # Audited P&L Statement (Net Sales, COGS, Profit)
├── manage-returns.html          # Return Claim Resolution & Stock Restoral
├── invoices.html                # Master Invoices Archive
│
├── css/
│   ├── style.css                # Base Theme, Typography, Layout, Header, Footer
│   ├── customer.css             # Customer Dashboard, Steppers & Wishlist Grid
│   ├── worker.css               # Task Cards, Checklist Styles & Punch Clock
│   ├── owner.css                # Executive P&L Cards & Admin Table System
│   └── responsive.css           # Desktop, Tablet, and Mobile Breakpoint Rules
│
├── js/
│   ├── config.js                # Supabase Dual-Mode Adapter & Config Modal
│   ├── validation.js            # Real-Time Input Checking (Email, Phone, Pass)
│   ├── auth.js                  # RBAC Engine, Profiles, Session Guard & Logout
│   ├── products.js              # 42-Item Database across 11 Grocery Categories
│   ├── cart.js                  # Cart Bounds, Promo Codes & Totals Engine
│   ├── wishlist.js              # Persistent Wishlist Toggle & Badges
│   ├── checkout.js              # Slot Capacity Calculations & Demo Payment
│   ├── orders.js                # 8-Stage Order Lifecycle & OTP Engine
│   ├── tracking.js              # 6-Stage Visual Timeline & Status Dispatcher
│   ├── worker.js                # Packing Checklist & Attendance Punch Engine
│   ├── owner.js                 # P&L Formulas, Employee CRUD & Financial KPIs
│   ├── inventory.js             # Stock Audit Trail, Suppliers & Operating Overheads
│   ├── billing.js               # GST Invoice Calculation, CGST/SGST & Print
│   └── script.js                # Master UI Coordinator, Drawer & Toasts
│
├── assets/images/               # High-Quality Scalable SVG Grocery Visuals
│   ├── banner/                  # Hero, Promo Deal & App Banners
│   ├── categories/              # 11 Category Icons (Fruits, Dairy, etc.)
│   └── products/                # 42 Item Illustrations
│
├── supabase/
│   ├── migrations/
│   │   └── 001_freshcart_schema.sql  # Complete 26-Table Relational Schema & RLS
│   └── functions/
│       ├── verify-otp/index.ts       # Secure Edge Function for OTP Handover
│       └── process-order/index.ts    # Secure Atomic Stock Deduction Edge Function
│
└── README.md                    # System Documentation & Testing Guide
```

---

## 6. Supabase Cloud Database Setup & Migrations

FreshCart is designed to work immediately in **Offline Demo Mode**, but can be connected to a live Supabase instance with two simple steps:

### Step 1: Execute Schema Migration
1. Log into your [Supabase Console](https://supabase.com).
2. Create a new project named `freshcart-grocery`.
3. Open the **SQL Editor** tab from the left sidebar.
4. Copy the entire contents of [`supabase/migrations/001_freshcart_schema.sql`](supabase/migrations/001_freshcart_schema.sql) and paste it into the editor.
5. Click **Run**. This establishes:
   - 26 Normalized Tables (`profiles`, `orders`, `order_items`, `products`, `categories`, `delivery_verifications`, `suppliers`, `purchases`, `expenses`, `attendance`, etc.).
   - Custom PostgreSQL ENUM types (`order_stage`, `user_role`, `worker_status`, etc.).
   - Granular Row-Level Security (RLS) policies protecting customer isolation and owner financial records.
   - Seed data for delivery slots and default categories.

### Step 2: Configure Keys in Frontend
1. In your Supabase Project Settings, copy your **Project URL** and **Public Anon Key**.
2. Open `FreshCart` in your browser.
3. Click the **"Configure Supabase"** link in the top banner or click **"Database Setup"** in the footer.
4. Paste your URL and Anon Key and click **Save & Connect**.
5. The application will instantly switch to **Live Cloud Mode**!

---

## 7. Accounting Formulas & Business Intelligence

To reflect real enterprise supermarket accounting, FreshCart uses strict financial principles rather than misleading "revenue = profit" assumptions:

$$\text{Net Sales} = \text{Gross Sales Revenue} - \text{Discounts} - \text{Refunds}$$

$$\text{Cost of Goods Sold (COGS)} = \sum (\text{Actual Wholesale Purchase Cost} \times \text{Quantity Sold})$$

$$\text{Estimated Gross Profit} = \text{Net Sales} - \text{Cost of Goods Sold}$$

$$\text{Estimated Net Profit} = \text{Gross Profit} - \text{Operating Expenses (Rent, Power, Wages, Fleet, Packaging)}$$

*Pending Cash on Delivery (COD) transactions are kept distinct until physical collection is confirmed by fulfillment staff upon doorstep delivery.*

---

## 8. Complete Acceptance Testing Guide

The system has been verified end-to-end across all 20 required workflows:

1. **Customer Self-Registration:** Navigate to `customer-register.html`. Test invalid emails and non-matching passwords to verify real-time red borders and error tooltips. Fill valid data to create an account.
2. **Customer Login:** Navigate to `customer-login.html`. Click "Auto Fill" for `customer@freshcart.com` and log in.
3. **Wishlist Management:** Browse `products.html`. Click the heart icon on any product. Verify the red heart state and top header wishlist counter. Open `wishlist.html` and click "Move to Cart".
4. **Stock Boundary Enforcement:** In `products.html` and `product-details.html`, notice that out-of-stock items disable the Add-to-Cart button.
5. **Cart Operations:** Open `cart.html`. Test increasing and decreasing quantities. Apply coupon `FRESH50` or `HEALTHY10`.
6. **Delivery Slot Scheduling:** Proceed to `checkout.html`. Select a delivery date (Today, Tomorrow, etc.) and observe dynamic remaining slot capacities.
7. **Simulated Online Payment:** Select "Online Payment (Demo)". Click "Confirm Order". The simulated payment modal opens with UPI QR and Card tabs. Click "Authorize & Pay".
8. **Live Order Tracking:** Upon confirmation, customer is redirected to `order-tracking.html`. Notice the 6-stage stepper and the prominently displayed **Doorstep Verification OTP** (e.g. `482915`).
9. **Owner Order Dispatch:** In a separate browser tab, navigate to `owner-login.html` and sign in (`owner@freshcart.com` / `owner123`). The new order appears on the dashboard. Assign worker **Suresh Kumar** from the dropdown.
10. **Worker Attendance Punch:** Sign into `worker-login.html` (`worker@freshcart.com` / `worker123`). Go to `worker-attendance.html`. Click "Check In". The digital clock logs shift start time.
11. **Worker Packing Station:** Open `packing-tasks.html`. The assigned order appears with its checklist. Check off individual items. Test reporting an item issue with a substitute recommendation. Click "Complete & Seal Packing".
12. **Doorstep Delivery & OTP Verification:** In the Worker portal, open `delivery-tasks.html`. Click "Start Transit". Input the customer's 6-digit OTP (and tick "Cash Collected" if COD). Click "Verify OTP & Mark Delivered".
13. **Order Completion Sync:** Re-check the Customer `order-tracking.html` tab. The stepper immediately reflects **Stage 6: Delivered** with timestamps.
14. **GST Tax Invoice:** In `my-orders.html`, click "Tax Invoice". View the itemized breakdown with CGST (2.5%) and SGST (2.5%). Click "Print Invoice" or "Save as PDF".
15. **Return Claim Submission:** In `my-orders.html`, click "Return / Refund". Select the delivered order, choose reason "Packaging damaged", and submit.
16. **Owner Return Approval & Restock:** In `owner-dashboard.html`, navigate to `manage-returns.html`. Review the claim and click "Approve & Restock". Notice that product inventory levels are safely restored in `inventory.html`.
17. **Inventory Management & Audit Trail:** In `inventory.html`, inspect the **Stock Movement Audit Trail** confirming automatic order deductions and restock logs.
18. **Inward Purchase Restocking:** In `purchases.html`, click "Record Inward Purchase". Restock 50 units of Apples from Himachal Agro Orchards. Verify physical stock increases on the catalog.
19. **Operating Expenses Logging:** In `expenses.html`, record a ₹5,000 cold chain electricity bill.
20. **Profit & Loss Statement Audit:** Navigate to `reports.html`. Verify that Net Sales, COGS, Gross Profit, and Net Operating Income calculate accurately.

---

## 9. License & Attribution

FreshCart is developed as a reference enterprise grocery shopping and fulfillment management system.  
© 2026 FreshCart Supermarket Pvt Ltd. All rights reserved.
