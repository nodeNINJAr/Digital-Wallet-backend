# Digital Wallet System

A **Digital Wallet System** built with **Node.js**, **Express**, and **MongoDB** that allows users to send and receive funds, manage wallets, and track transactions with proper authentication and authorization.

---

## 📝 Table of Contents

- [Digital Wallet System](#digital-wallet-system)
  - [📝 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🛠 Tech Stack](#-tech-stack)
  - [🚀 Installation](#-installation)
- [jwt](#jwt)
- [express session](#express-session)
- [admin](#admin)

---

## ✨ Features

- User registration, login, and authentication using JWT  
- Role-based access control (Admin, User, Agent)  
- Create and manage multiple wallets  
- Send and receive, cashin money between wallets  
- Track transactions with unique auto-generated transaction IDs  
- View transaction history with **pagination and sorting**  
- Wallet status management (Active, Blocked)  
- Security features: password hashing (bcryptjs), JWT, sessions  

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express  
- **Database:** MongoDB with Mongoose ORM  
- **Authentication:** JWT, Passport.js  
- **Validation:** Zod  
- **Other Tools:** dotenv, cors, cookie-parser, express-session  

---

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/nodeNINJAr/Digital-Wallet-backend
cd digital-wallet-system


Install dependencies:

npm install


Set up environment variables (see below).

Start the server:

npm run dev


Server should run on http://localhost:5000 (or your configured port).

🔑 Environment Variables

Create a .env file in the root directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
SESSION_SECRET=your_session_secret
NODE_ENV=development
BCRIPT_SOLT_ROUND=10
# jwt
JWT_ACCESS_SECRET=jwtsecretjbhjhj
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=hjsbmdddddddddd
JWT_REFRESH_EXPIRES=30d
# express session
EXPRESS_SESSION_SECRET=keyboard cat
# admin
ADMIN_EMAIL=admin email
ADMIN_PASS=password

📦 API Endpoints
Auth Routes

POST /api/auth/register – Register a new user

POST /api/auth/login – Login user and get JWT

User Routes

GET /api/users – Get all users (Admin only, supports pagination & sorting)

PATCH /api/users/agent-status – Update agent status to PENDING

Wallet Routes

GET /api/wallets/me – Get logged-in user wallet

POST /api/wallets/transactions – Transfer money to another wallet

Transaction Routes

GET /api/transactions – Get all transactions (Admin, supports pagination & sorting)

GET /api/transactions/me – Get logged-in user transactions

Pagination & sorting example:
/api/transactions/me?page=2&limit=10&sortBy=amount&sortOrder=asc

⚡ Usage

Register a user and login to get a JWT.

Use the JWT in the Authorization header for all protected routes:

Authorization: Bearer <your_jwt_token>


Admin users can fetch all users, while normal users can view their own wallet and transaction history.

📁 Folder Structure


🎥 Video Explanation

Watch the full video explanation of the project here:


📌 Notes

Transaction IDs are automatically generated in the format: TXN-YYYYMMDD-xxxx

Wallets can be blocked, preventing transactions from that wallet

Supports pagination and sorting for user and transaction queries