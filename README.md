# Bank Account Management System  
Full-Stack Take-Home Assignment — Frontend + Backend

This project implements a complete **Bank Account Management System** as required in the technical task.  
It includes a full **React/Next.js frontend**, **Node.js (Express) backend**, **Prisma ORM**, logging system, authentication, authorization, account management, and transaction flows.

---

## 🚀 Tech Stack

### **Frontend**
- Next.js (App Router)
- React.js
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Axios (API handling)
- React Hot Toast / Toastify (notifications)

### **Backend**
- Node.js (Express)
- Prisma ORM
- SQLite DB (simple for assignment)
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- express-rate-limit
- Helmet, CORS, Morgan
- Custom logging middleware

---

## 🔐 Features & Requirements — Implemented 100%

### **1. Authentication**
- User registration → status = **INACTIVE** by default
- Admin & User login
- JWT-based authentication
- Logout
- Auto-create bank account for new users
- Admin-created users get temporary auto-generated password

---

### **2. Account Management**
#### Admin
- Create new accounts (name, email, mobile, profile picture)
- User created by admin → **ACTIVE**
- Auto-generated password returned to admin
- Update user info (name, mobile, address, status)
- Activate / Deactivate user
- Delete user + account + transactions
- View all accounts

#### User
- Update profile (name, address, avatar)
- Cannot modify (email, mobile, account number)

---

### **3. Account Display**
- Admin → List all accounts
- User → View personal account details

---

### **4. Transactions**
#### User Dashboard:
- View **current balance**
- View **credit / debit history**

#### Admin:
- Credit any account  
- Debit any account  
- Validate insufficient balance (error toast)

---

### **5. Notifications**
- Green toast → credit  
- Yellow toast → debit   
- Red toast → errors  
- Modern UI toast system

---

### **6. Logging (UI + Backend)**
Stored in DB (Log table):
- `message`
- `userId`
- `haveError`
- `type` (1 = UI log, 2 = Backend API)
- `createdAt`

---

### **7. Performance**
- express-rate-limit → 250 requests/minute  
- Backend logger enabled

---

## 🏗️ Folder Structure
/frontend
/app
/components
/store
/lib
/public
README.md

/backend
/src
/routes
/middleware
/prisma
server.ts
prisma/schema.prisma
README.md
---

# 🛠️ **How to Run the Project (Local Setup)**

## 1️⃣ Clone the repo
```sh
git clone https://github.com/Mostafa-Ragab/bank-account-system.git
cd bank-account-system

🔧 Backend Setup (Node.js + Prisma + SQLite)

1. Install dependencies
cd backend
npm install
2. Create .env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"

3. Migrate DB
npx prisma migrate dev

4. Seed Admin User (optional)
backend/src/prisma/seedAdmin.ts
npm run seed

Start backend
npm run dev
Backend running at:
http://localhost:4000



🎨 Frontend Setup (Next.js)

1. Install dependencies
cd frontend
npm install
2. env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api

3. Run development server
npm run dev
Frontend running at:
http://localhost:3000

🔐 Default Admin Credentials
Email
Password
admin@admin.com
Admin@123

📝 Notes
	•	All APIs protected by JWT middleware
	•	UI and backend logs stored in DB
	•	Fully typed TypeScript codebase
	•	Admin dashboard + user dashboard fully implemented
	•	Modern responsive UI following design system (atoms/molecules/organisms)





Mostafa Ragab
LinkedIn: https://www.linkedin.com/in/mostafa-raslan
