# Professional Store Management System

A modern, full-stack store management application built with Node.js, Express, and React. This system provides a comprehensive dashboard for tracking inventory, sales, customers, and debts with a premium glassmorphic UI.

## 🚀 Key Features

### 📊 Professional Dashboard
- **Real-time Statistics**: View total products, customers, revenue, and pending debts at a glance.
- **Interactive Charts**: Visualized data using Recharts (Revenue Overview and Inventory Mix).
- **Dynamic Theme**: Full support for **Dark and Light modes** with a smooth toggle.

### 🛠️ Core Modules (Full CRUD)
The system includes complete Create, Read, Update, and Delete functionality for:
- **Product Management**: Track inventory levels, stock status, and pricing.
- **Customer Directory**: Maintain a database of your clients and their contact details.
- **Sales Transactions**: Record and manage daily sales with automated totals.
- **Debt Ledger**: Track credit sales, monitor remaining balances, and process partial payments.

### 🛡️ Secure Backend
- **Data Validation**: Comprehensive server-side validation using **Joi**.
- **User Authentication**: Secure Login and Registration system.
- **Role-based Access**: Admin and User dashboards with protected routes.

---

## 💻 Tech Stack

- **Frontend**: React.js, Vite, Recharts, React Icons, CSS3 (Glassmorphism).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Validation**: Joi.

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB account (Atlas or local)

### 1. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` folder and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

- `/client`: React frontend (Vite).
- `/server`: Node.js/Express backend.
- `/server/models`: Mongoose schemas.
- `/server/routes`: API endpoints.
- `/server/middleware`: Authentication and Joi validation.

---

## 🎓 Student Rules Compliance
- Backend: Node.js (Express).
- Database: MongoDB.
- Validation: Joi (Server-side).
- Dashboard: Stats cards, 2+ charts, dark/light mode toggle.
- CRUD: 4 modules (Product, Customer, Sales, Debt).
- Documentation: Full setup instructions and feature list.
