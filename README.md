# FreshCart – Advanced Grocery Shop Management System

FreshCart is a modern, responsive, and feature-rich online grocery shopping and store management web application built entirely with **pure HTML5, CSS3, and Vanilla JavaScript**, leveraging **LocalStorage** for frontend data persistence.

The platform provides a complete customer shopping experience along with role-based administrative portals for the **Shop Owner** and **Shop Worker**.

---

## 🌟 Key Features

### 1. Customer Storefront & E-Commerce
- **Responsive Layout**: Designed for mobile, tablet, laptop, and desktop displays with smooth navigation.
- **11 Grocery Categories**:
  - Fresh Fruits
  - Green Vegetables
  - Dairy Products
  - Bakery Items
  - Snacks & Munchies
  - Cold Beverages
  - Rice & Grains
  - Aromatic Spices
  - Personal Care
  - Household Essentials
  - Frozen Foods
- **Catalog Filtering & Sorting**: Filter by category, live keyword search, dynamic price slider (₹40 to ₹800), customer star ratings, and stock availability. Sort by Featured, Price (Low-High / High-Low), Rating, and Name (A-Z).
- **Product Details View**: Large product display, savings badge, nutritional breakdown, storage instructions, and related items.
- **Dynamic Shopping Cart**: Real-time quantity adjustments with stock limits, promo coupon engine (`FRESH50`, `HEALTHY10`, `WELCOME100`), delivery fee calculations (Free above ₹500), and 5% GST calculation.
- **Checkout & Order Placement**: Multi-slot delivery preferences (2-Hour Express, Morning, Evening), packing instructions, address validation, and simulated payment methods (COD, UPI, Card, Net Banking).
- **Official Tax Invoice**: Auto-generated GST-compliant invoice (`invoice.html`) with Print and Download (.txt) support.
- **Customer Account & Tracking**: Profile management with real-time validated editing and a **5-Step Live Order Progress Stepper** (`Placed` ➔ `Accepted` ➔ `Packing` ➔ `Out for Delivery` ➔ `Delivered`).

### 2. Shop Owner Dashboard (`owner-dashboard.html`)
- **Key Metrics Overview**: Real-time gross sales total, order count, active orders, delivered orders, and low-stock alerts.
- **Order Management**: View detailed customer info, delivery destinations, and item breakdown. Update status across the 8-stage lifecycle.
- **Product & Stock CRUD**: Add new grocery items, edit details, adjust prices, delete items, and execute quick stock increments (`+5`, `+10`, `-1`).
- **Category Oversight**: Category cards showing product inventory counts.
- **Sales Analytics**: Visual category revenue breakdown and top 5 best-selling products.
- **Kitchen Preparation Settings**: Configurable default preparation window (minutes) and packing deadlines.

### 3. Shop Worker Packing Terminal (`worker-dashboard.html`)
- **Fulfillment Station**: Real-time active orders queue with received time, packing deadline, and live countdown timer.
- **Urgent & Overdue Alerts**: Highlights urgent orders ($\le 10$ mins) and overdue orders.
- **Interactive Checklist**: Check off items individually into delivery bags.
- **Fulfillment Workflow**: Advance orders from `New Order` ➔ `Accepted` ➔ `Preparing` ➔ `Packed` ➔ `Ready for Delivery`.
- **Role Isolation**: Strict protection preventing access to sales, finances, passwords, or product catalogs.

---

## 👥 Demo Accounts & Roles

| Role | Email | Password | Primary Portal |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@freshcart.com` | `customer123` | Storefront & `profile.html` |
| **Shop Owner** | `owner@freshcart.com` | `owner123` | `owner-dashboard.html` |
| **Shop Worker** | `worker@freshcart.com` | `worker123` | `worker-dashboard.html` |

*Note: On `login.html`, click any of the 1-Click Role Login buttons to autofill demo credentials immediately.*

---

## 🛠️ Technology Stack

- **Markup**: HTML5 (Semantic elements)
- **Styling**: CSS3 (Custom variables, flexbox, CSS grid, media queries)
- **Scripting**: Vanilla JavaScript (ES6+, DOM manipulation, event listeners)
- **Storage**: LocalStorage (Session management, inventory, cart, and orders)
- **Icons**: Font Awesome 6 CDN & Local SVG Fallbacks
- **Fonts**: Poppins via Google Fonts

---

## 📂 Project Structure

```
FreshCart/
│
├── index.html              # Customer Home Page
├── about.html              # About Us & Quality Flow
├── products.html           # 11-Category Product Catalog
├── product-details.html    # Product Details Page
├── cart.html               # Shopping Cart Page
├── checkout.html           # Checkout & Inventory Reservation
├── contact.html            # Contact & Support Page
├── login.html              # Role-Based Sign In
├── register.html           # Customer Registration
│
├── owner-dashboard.html    # Shop Owner Management Portal
├── worker-dashboard.html   # Shop Worker Packing Terminal
├── invoice.html            # Printable Tax Invoice View
├── profile.html            # Customer Profile & Live Order Tracker
│
├── css/
│   └── style.css           # Complete Responsive Stylesheet
│
├── js/
│   ├── script.js           # Multi-Account Auth, Validation & UI
│   ├── products.js         # 11 Categories, 42 Products & Stock CRUD
│   └── cart.js             # Cart Engine, Orders & Billing
│
└── images/
    ├── banner/             # Promotional Banners
    ├── categories/         # Category SVG Illustrations
    └── products/           # 42 Fallback Product SVGs
```

---

## 🚀 How to Run Locally

1. Clone or download this repository:
   ```bash
   git clone https://github.com/divyapriyaganesh23-code/Grocery-Shop.git
   ```
2. Open `index.html` or `login.html` directly in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge).
3. No build tools, Node.js, or local servers are required!

---

## 📜 Academic Disclaimer

This project was developed for **academic and portfolio demonstration purposes**. It uses client-side `localStorage` to simulate full database persistence and session states within a single browser environment. For production multi-user deployments across separate devices, integrate a backend server (e.g., Node.js / Python / Go) with a database (e.g., PostgreSQL / MongoDB) and secure server-side authentication.
