# EasyStock 

EasyStock is a user-friendly platform designed to manage products and inventory effortlessly. It lets you monitor your current stock levels, spot items that are running low, and keep track of everything entering or leaving your storage.

# Main features:

**Product List:** Easily add, edit, or remove items, including their names, prices, and categories.
**Stock In and Out:** Keep track of items when new shipments arrive or when items are sold and taken away.
**Low Stock Warnings:** See alerts right away if an item is running low or completely out of stock.
**Activity History:** Keeps a log of every change made to your inventory so you can always check past actions.
**Export Data:** Download your inventory list as a spreadsheet file (CSV) whenever you need it.

---

## 1. Project Folder & File Structure

Below is the complete file and directory layout for the **EasyStock** inventory management system built with Node.js, Express, and MySQL:

```
easystock/
├── .env                      # [M1: Abellon - @abelloncjnickole-collab] Database configuration & credentials
├── .gitignore                # [Team / Lead] Excludes node_modules & secret env files from Git
├── README.md                 # [Team Lead] Setup & running instructions
├── index.js                  # [M1: Abellon - @abelloncjnickole-collab] Entry point (Express server & static file host)
├── package-lock.json         # [Team / Lead] Locked dependency version tree
├── package.json              # [Team / Lead] Project dependencies & npm scripts
├── config/
│   └── db.js                 # [M1: Abellon - @abelloncjnickole-collab] MySQL database connection pool configuration
├── controllers/
│   ├── authController.js     # [M1: Abellon - @abelloncjnickole-collab] User authentication controller
│   ├── productController.js  # [M2: Palmis - @mingoymarkjohnpaul-del] Product CRUD controller
│   └── stockController.js    # [M3 & M4: Bulata & Alvarado - @Robren2005 / @kurtalvarado05-coder] Stock In/Out controller
├── models/
│   ├── Product.js            # [M2: Palmis - @mingoymarkjohnpaul-del] SQL queries for products table
│   ├── StockLog.js           # [M5: Gemina - @R0nielGemina] SQL queries for stock_logs audit table
│   └── User.js               # [M1: Abellon - @abelloncjnickole-collab] SQL queries for users table
├── public/
│   ├── index.html            # [M6: Alcorcon - @Dev-Hisayuki] Complete EasyStock dashboard UI
│   ├── css/
│   │   └── style.css         # [M6: Alcorcon - @Dev-Hisayuki] Custom CSS overrides
│   └── js/
│       └── main.js           # [M6: Alcorcon - @Dev-Hisayuki] Client-side API fetch logic
└── routes/
    ├── authRoutes.js         # [M1: Abellon - @abelloncjnickole-collab] Authentication API routes (/api/auth)
    ├── productRoutes.js      # [M2: Palmis - @mingoymarkjohnpaul-del] Product API routes (/api/products)
    └── stockRoutes.js        # [M3 & M4: Bulata & Alvarado] Stock adjustment API routes (/api/stock)
```

---

## 2. Ownership Matrix (Section 5.4 Compliance)

Each team member owns their feature area end-to-end (Database Tables, Models, Controllers, Routes, Frontend Screens, and assigned SQL JOIN Queries).

| Member | Student Name | GitHub Username | Role & Focus Area (5.3 Split) | Database Tables | Endpoints & Screens | Assigned SQL Join Report | Assigned File Ownership |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **M1** | **Alcorcon** *(Leader)* | `@Dev-Hisayuki` | **Core & System Setup** | `admins`, `activity_logs`, `system_settings` | Login Screen, Database Setup, Global System Logs | **INNER JOIN:** Activity Logs (`activity_logs`) with Admin Details (`admins`) | `.env`, `index.js`, `config/db.js`, `models/User.js`, `controllers/authController.js`, `routes/authRoutes.js` |
| **M2** | **Palmis** | `@mingoymarkjohnpaul-del` | **Master Data & Catalog** | `categories`, `products`, `suppliers` | Dashboard Overview, Product Catalog, Category Screen | **LEFT JOIN:** All Products (`products`) with optional Supplier information (`suppliers`) | `models/Product.js`, `controllers/productController.js`, `routes/productRoutes.js`, Catalog views in `public/` |
| **M3** | **Bulata** | `@Robren2005` | **Transactions & Stock-In** | `stock_in_records`, `stock_in_details`, `warehouses` | Stock-In Form, Goods Receiving, Warehouse Details View | **INNER JOIN:** Stock-In Records (`stock_in_records`) with Product and Supplier Data | Stock-In routines in `models/StockLog.js`, `controllers/stockController.js`, and `routes/stockRoutes.js` |
| **M4** | **Alvarado** | `@kurtalvarado05-coder` | **Transactions & Stock-Out** | `stock_out_records`, `stock_out_details`, `clients` | Dispatch Form (Stock-Out), Shipment Details View, Client Order Status | **LEFT JOIN:** Stock-Out Orders (`stock_out_records`) with Client and Product Info | Stock-Out logic in `controllers/stockController.js`, `routes/stockRoutes.js`, and dispatch forms in `public/` |
| **M5** | **Gemina** | `@R0nielGemina` | **Reports, Audit & Low Stock** | `low_stock_alerts`, `inventory_valuation`, `audit_reports` | Reports Screen, Valuation Summary, Low Stock Alert Dashboard | **FULL OUTER JOIN (UNION):** Products (`products`) with Stock Level and Valuation Status | `models/StockLog.js`, audit reporting endpoints in `controllers/`, CSV utilities & reports in `public/js/main.js` |
| **M6** | **Abellon** | `@abelloncjnickole-collab` | **User Management & UI Integration** | `users`, `roles`, `permissions` | User Directory, Role Assignment Form, Account Settings Screen | **INNER JOIN:** Users (`users`) with assigned Roles and Permissions | `public/index.html`, `public/css/style.css`, DOM integration in `public/js/main.js` |

---

## 3. Git Branching Rules

- **`main`**: Protected branch. Only tested, merged pull requests are allowed.
- **Member Feature Branches:**
  - `feature/m1-core-auth`
  - `feature/m2-catalog`
  - `feature/m3-stock-in`
  - `feature/m4-stock-out`
  - `feature/m5-reports-audit`
  - `feature/m6-user-ui`