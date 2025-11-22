# Bank Account Management System

Full-Stack Assessment --- **Next.js + Node.js + Prisma**

This project implements a complete **Bank Account Management System** as
requested in the assignment.\
It includes a full **React/Next.js frontend**, **Express backend**,
**Prisma ORM**, authentication, authorization, account/transaction
flows, and a full logging system.

## 🚀 Tech Stack

### Frontend

-   Next.js (App Router)
-   React + TypeScript
-   Tailwind CSS
-   Zustand
-   Axios
-   React Hot Toast

### Backend

-   Node.js (Express)
-   Prisma ORM
-   SQLite
-   JWT Authentication
-   bcryptjs
-   express-rate-limit
-   Helmet, CORS
-   Custom Logging Middleware

## ✅ Features & Requirements (100% Completed)

### 1. Authentication

-   User registration → INACTIVE by default
-   Admin & User login
-   JWT-based auth
-   Auto-create account for users
-   Admin-created users receive temporary generated password

### 2. Account Management

#### Admin

-   Create new users/accounts
-   Update user info (name, mobile, address, status)
-   Activate/Deactivate users
-   Delete user + account + transactions
-   View all accounts

#### User

-   Update: name, address, profile picture
-   Cannot update: email, mobile, account number

### 3. Account Display

-   Admin → list all accounts
-   User → view own account details

### 4. Transactions System

#### User

-   View balance
-   View credit/debit history

#### Admin

-   Credit/debit transactions
-   Insufficient balance validation

### 5. Notifications

-   Green toast → credit
-   Yellow toast → debit
-   Red toast → error

### 6. Logging System

Stored in DB: - message - userId - haveError - type (1 = UI, 2 =
Backend) - createdAt

### 7. Performance

-   express-rate-limit → 250 RPM
-   Helmet enabled

## 🛠️ Setup

### Backend

    cd backend
    npm install

Create `.env`:

    DATABASE_URL="file:./dev.db"
    JWT_SECRET="your-secret-key"

Migrate:

    npx prisma migrate dev

Run:

    npm run dev

### Frontend

    cd frontend
    npm install

Create `.env.local`:

    NEXT_PUBLIC_API_URL=http://localhost:4000/api

Run:

    npm run dev

## 🔐 Default Admin Credentials

Email: admin@admin.com\
Password: Admin@123

## 👨‍💻 Author

**Mostafa Ragab**\
LinkedIn: https://www.linkedin.com/in/mostafa-raslan
