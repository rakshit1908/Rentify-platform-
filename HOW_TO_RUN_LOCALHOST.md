# 🚀 Rentify - Localhost Run Karne Ka Complete Guide

Yeh guide follow karke tum **khud** localhost run kar sakte ho.

---

## 📋 Prerequisites (Pehle Check Karo)

```powershell
# Node.js installed hai ya nahi check karo
node --version
# Output: v18.x.x ya higher (agar nahi hai to install karo)

# npm installed hai ya nahi
npm --version
# Output: 9.x.x ya higher
```

Agar Node.js nahi hai to download karo: https://nodejs.org/

---

## 🎯 Method 1: VS Code Terminal Se (Recommended)

### Step 1: VS Code Open Karo
1. VS Code kholo
2. File → Open Folder
3. Select: `d:\Rentify`

### Step 2: Terminal Kholo
1. VS Code mein **Terminal** menu click karo
2. Ya shortcut: **Ctrl + `** (backtick key)
3. Ya View → Terminal

### Step 3: Backend Server Start Karo

Terminal mein yeh commands type karo:

```powershell
# Backend folder mein jao
cd backend

# Server start karo
node server.js
```

✅ **Success Output:**
```
  ╔══════════════════════════════════════╗
  ║        Rentify API — Running         ║
  ║  Port    : 5000                       ║
  ║  Env     : development               ║
  ║  Health  : http://localhost:5000/api/health ║
  ╚══════════════════════════════════════╝
```

⚠️ **Is terminal ko CLOSE MAT karo!** Server band ho jayega.

### Step 4: Naya Terminal Kholo (Frontend Ke Liye)

1. VS Code mein **+** icon click karo (terminal ke paas)
2. Ya **Ctrl + Shift + `** press karo
3. Naya terminal khul jayega

### Step 5: Frontend Server Start Karo

Naye terminal mein:

```powershell
# Frontend folder mein jao
cd frontend

# Development server start karo
npm run dev
```

✅ **Success Output:**
```
  VITE v8.2.1  ready in 2204 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🎯 Method 2: PowerShell Se (Separate Windows)

### Option A: Do Alag PowerShell Windows

**Window 1 - Backend:**
```powershell
# PowerShell kholo (Start → Search "PowerShell")
cd d:\Rentify\backend
node server.js
```

**Window 2 - Frontend:**
```powershell
# Dusra PowerShell window kholo
cd d:\Rentify\frontend
npm run dev
```

### Option B: Ek Hi Window Mein (Background Tasks)

```powershell
# Backend ko background mein chalao
cd d:\Rentify\backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"

# Frontend ko background mein chalao
cd d:\Rentify\frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

---

## 🎯 Method 3: Command Prompt (CMD) Se

### Terminal 1 - Backend:
```cmd
cd d:\Rentify\backend
node server.js
```

### Terminal 2 - Frontend:
```cmd
cd d:\Rentify\frontend
npm run dev
```

---

## 🌐 Browser Mein Website Kholna

Jab dono servers chal rahe hon:

### Method 1: Direct URL
1. Browser kholo (Chrome/Edge/Firefox)
2. Address bar mein type karo: `localhost:5173`
3. Enter press karo

### Method 2: Full URL
```
http://localhost:5173/
```
Copy karke browser mein paste karo

### Method 3: Ctrl+Click (VS Code Se)
VS Code terminal mein `http://localhost:5173/` par **Ctrl+Click** karo

---

## 🛑 Servers Band Karna (Stop)

### Method 1: Ctrl+C
Har terminal mein `Ctrl + C` press karo

### Method 2: Terminal Close
Terminal window close kar do

### Method 3: Task Manager
1. Task Manager kholo (Ctrl+Shift+Esc)
2. "Node.js" processes ko End Task karo

---

## ✅ Verification - Sahi Se Chal Raha Hai Ya Nahi

### Check 1: Backend Health
Browser mein kholo:
```
http://localhost:5000/api/health
```

Output dikhna chahiye:
```json
{
  "status": "ok",
  "timestamp": "2024-06-03T12:00:00.000Z",
  "environment": "development"
}
```

### Check 2: Frontend
Browser mein kholo:
```
http://localhost:5173/
```

Dikhna chahiye:
- ✅ Rentify navbar
- ✅ "Find a place you'll love to call home" headline
- ✅ Browse Properties button
- ✅ Gradient background

---

## 📝 Quick Commands Cheat Sheet

```powershell
# ═══════════════════════════════════════════════════════
# BACKEND COMMANDS
# ═══════════════════════════════════════════════════════

cd d:\Rentify\backend          # Backend folder open
node server.js                  # Server start
# Ctrl+C to stop

# ═══════════════════════════════════════════════════════
# FRONTEND COMMANDS
# ═══════════════════════════════════════════════════════

cd d:\Rentify\frontend         # Frontend folder open
npm run dev                     # Development server start
# Ctrl+C to stop

npm run build                   # Production build banao
npm run preview                 # Production preview dekho

# ═══════════════════════════════════════════════════════
# TROUBLESHOOTING COMMANDS
# ═══════════════════════════════════════════════════════

# Port already in use error
netstat -ano | findstr "5173"  # Port 5173 kaun use kar raha hai
netstat -ano | findstr "5000"  # Port 5000 kaun use kar raha hai

# Process kill karo
taskkill /PID <process_id> /F

# Node modules reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
npm install

cd ..\backend
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🐛 Common Problems & Solutions

### Problem 1: "node is not recognized"
**Solution:**
- Node.js install nahi hai
- Download karo: https://nodejs.org/
- Install karne ke baad terminal restart karo

### Problem 2: "Port 5173 is already in use"
**Solution:**
```powershell
# Pehle wala process kill karo
netstat -ano | findstr "5173"
taskkill /PID <process_id> /F

# Phir se try karo
npm run dev
```

### Problem 3: "Cannot find module"
**Solution:**
```powershell
# Dependencies install karo
cd d:\Rentify\frontend
npm install

cd ..\backend
npm install
```

### Problem 4: "Permission denied"
**Solution:**
```powershell
# PowerShell ko Admin mode mein chalao
# Start → PowerShell → Right click → Run as Administrator
```

### Problem 5: "ENOENT: no such file or directory"
**Solution:**
```powershell
# Sahi folder mein ho ya nahi check karo
pwd                    # Current directory dekho
cd d:\Rentify         # Correct folder mein jao
```

### Problem 6: Website white/blank page
**Solution:**
```powershell
# Hard refresh browser mein
# Ctrl + Shift + R

# Ya cache clear karo
# Ctrl + Shift + Delete
```

### Problem 7: "SUPABASE_URL is not set"
**Solution:**
- Yeh warning ignore kar sakte ho (UI dekhne ke liye)
- Full features ke liye Supabase setup karo (SUPABASE_SETUP.md dekho)

---

## 📊 Expected Output Timeline

```
Step 1: cd d:\Rentify\backend
        → Current directory changed ✓

Step 2: node server.js
        → [Wait 2-3 seconds]
        → Backend server running on port 5000 ✓

Step 3: New terminal → cd d:\Rentify\frontend
        → Current directory changed ✓

Step 4: npm run dev
        → [Wait 5-10 seconds]
        → Frontend server running on port 5173 ✓

Step 5: Open browser → localhost:5173
        → [Website loads]
        → Rentify homepage visible ✓
```

---

## 🔄 Restart Karna (Fresh Start)

Agar kuch gadbad ho jaye:

```powershell
# 1. Sab band karo (Ctrl+C in both terminals)

# 2. Backend restart
cd d:\Rentify\backend
node server.js

# 3. Frontend restart (new terminal)
cd d:\Rentify\frontend
npm run dev

# 4. Browser refresh (Ctrl+Shift+R)
```

---

## 📱 Mobile/Tablet Se Dekhna

Agar same WiFi pe ho:

```powershell
# Terminal mein yeh command:
cd d:\Rentify\frontend
npm run dev -- --host

# Output mein Network URL dikhega:
# Network: http://192.168.x.x:5173/

# Is URL ko mobile browser mein kholo
```

---

## 🎯 Daily Use Workflow

### Morning (Start Karo):
```powershell
# Terminal 1
cd d:\Rentify\backend
node server.js

# Terminal 2
cd d:\Rentify\frontend
npm run dev
```

### Evening (Band Karo):
```powershell
# Dono terminals mein:
Ctrl + C
```

---

## 📚 Additional Commands

```powershell
# Check karo kya chal raha hai
netstat -ano | findstr "LISTENING"

# All Node processes dekho
tasklist | findstr "node"

# Git status check
cd d:\Rentify
git status

# Code open in VS Code
cd d:\Rentify
code .

# Package install/update
npm install <package-name>
npm update
```

---

## 🆘 Help & Support

### Quick Checks:
1. ✅ Node.js installed? → `node --version`
2. ✅ Correct folder? → `pwd`
3. ✅ Dependencies installed? → Check `node_modules` folder exists
4. ✅ Port free? → `netstat -ano | findstr "5173"`
5. ✅ Terminal admin mode? → Right-click → Run as Admin

### Log Files Check:
```powershell
# Backend errors dekho
cd d:\Rentify\backend
node server.js 2>&1 | Tee-Object -FilePath logs.txt

# Frontend errors dekho
cd d:\Rentify\frontend
npm run dev 2>&1 | Tee-Object -FilePath logs.txt
```

---

## 🎉 Success Checklist

- [ ] Node.js installed
- [ ] VS Code opened in `d:\Rentify` folder
- [ ] Backend terminal running (`node server.js`)
- [ ] Frontend terminal running (`npm run dev`)
- [ ] Backend URL accessible: http://localhost:5000/api/health
- [ ] Frontend URL accessible: http://localhost:5173/
- [ ] Website UI visible in browser
- [ ] No errors in terminal

---

## 🚀 Ready to Go!

Ab tum **khud localhost run kar sakte ho**! 

Commands simple hain:
1. **Backend**: `cd d:\Rentify\backend` → `node server.js`
2. **Frontend**: `cd d:\Rentify\frontend` → `npm run dev`
3. **Browser**: `localhost:5173`

**Happy Coding! 🎉**

# UI update: September 2026

The homepage and navbar now use the new Rentify premium real-estate UI. The supplied house image is at `frontend/src/assets/rentify-house.png`.

## First run after extracting the ZIP

1. Open two terminals in the `Rentify` folder.
2. In `backend`, fill `.env` with the credentials for the current Supabase `rentify` project.
3. In `frontend`, fill `.env` with the same project's public URL and anon key.
4. Install dependencies once:
   - `cd backend` → `npm install` → `npm run dev`
   - `cd frontend` → `npm install` → `npm run dev`
5. Open `http://localhost:5173`.
6. Verify the backend health endpoint at `http://localhost:5000/api/health`.

The homepage first tries to load real properties from `/api/properties`. If the database has no listings yet, it shows three clearly styled demo cards using the supplied house image so the new UI can still be checked. Once real listings exist, the cards automatically use their uploaded Supabase Storage images.
