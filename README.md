# Admin Dashboard - Quick Start Guide

## 🚀 Running the Application

### **1. Start Backend Server**
```bash
cd backend
npm start
```
Server will run on: `http://localhost:3000`

### **2. Start Admin Dashboard**
```bash
cd admin-dashboard
npm run dev
```
Dashboard will run on: `http://localhost:5173`

---

## 👤 Create Admin User

**First time setup - Create an admin user:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "isAdmin": true
  }'
```

**Or use any REST client (Postman, Thunder Client, etc.):**
- **URL:** `POST http://localhost:3000/api/users`
- **Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "isAdmin": true
}
```

---

## 🔐 Login Credentials

Once admin user is created, login with:

- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## ✅ Test Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Expected response:
```json
{
  "_id": "...",
  "name": "Admin User",
  "email": "admin@example.com",
  "isAdmin": true,
  "token": "eyJhbGc..."
}
```

---

## 🌐 Access Dashboard

1. Open browser: `http://localhost:5173`
2. You'll be redirected to: `http://localhost:5173/login`
3. Enter credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Click "Login"
5. You'll be redirected to: `http://localhost:5173/dashboard`

---

## 📋 Available Menu Items

Once logged in, you'll see the sidebar with:

1. **Dashboard** - Overview with stats
2. **Products** - (Coming Soon)
3. **Categories** - (Coming Soon)
4. **Orders** - (Coming Soon)
5. **Users** - (Coming Soon)
6. **Returns** - (Coming Soon)
7. **Shipping** - (Coming Soon)
8. **Banners** - (Coming Soon)
9. **Offers** - (Coming Soon)
10. **Reports** - (Coming Soon)
11. **Settings** - (Coming Soon)

---

## 🔧 Troubleshooting

### **Backend not starting?**
```bash
cd backend
npm install
npm start
```

### **Frontend not starting?**
```bash
cd admin-dashboard
npm install
npm run dev
```

### **Login failing?**
1. Make sure backend is running on port 3000
2. Create admin user (see above)
3. Check `.env` in admin-dashboard:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```
4. Clear browser cache and try again

### **CORS errors?**
Backend already has CORS enabled. If issues persist, check backend logs.

---

## 📊 Current Status

**Module 1 Complete:**
- ✅ Authentication
- ✅ Protected Routes
- ✅ Sidebar Navigation
- ✅ Header with User Menu
- ✅ Dashboard Overview

**Next Modules:**
- ⏳ Dashboard API Integration
- ⏳ Product Management
- ⏳ Order Management
- ⏳ And more...

---

## 🎯 Quick Commands

```bash
# Backend
cd backend && npm start

# Frontend
cd admin-dashboard && npm run dev

# Create admin
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Admin","email":"admin@example.com","password":"admin123","isAdmin":true}'

# Test login
curl -X POST http://localhost:3000/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Happy coding! 🚀
