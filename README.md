# CamScanner - Intelligent Document Scanner

CamScanner is a full-stack web application that mimics the functionality of CamScanner. It allows users to upload document images, automatically detects and crops the document using intelligent image processing algorithms, and securely saves it.

---

## 📄 Table of Contents

- [Features](#-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Environment Variables](#%EF%B8%8F-environment-variables)
- [Local Installation & Setup](#-%EF%B8%8F-local-installation--setup)
- [Deployment Guide](#-deployment-guide)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

- **Smart Auto-Crop:** Automatically detects document edges and crops background noise using a custom edge-density and center-weighted algorithm.
- **Image Processing:** Enhances image contrast and brightness for better readability.
- **Secure Cloud Storage:** Stores original and processed images on Cloudinary.
- **User Gallery:** Saves scan history per user using Firebase Firestore.
- **Authentication:** Secure Login and Signup via Firebase Authentication.
- **Drag & Drop Interface:** Easy-to-use frontend built with React and Tailwind CSS.
- **Responsive Design:** Works on desktop and mobile.

---

## 🛠️ Tech Stack

### **Frontend:**
- React (Vite)
- Tailwind CSS
- Firebase Auth (Client SDK)

### **Backend:**
- Node.js & Express
- Jimp (Image Processing)
- Multer (File Uploads)
- Firebase Admin SDK (Firestore Database)
- Cloudinary SDK (Image Storage)

---

## ⚙️ Environment Variables

To run this project, you will need to set up environment variables.

### 1. Server (`server/.env`)
Create a `.env` file in the `server` folder with the following keys:

```env
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# For Local Development (Optional if using Env Var below)
# FIREBASE_SERVICE_ACCOUNT (JSON file path)
```

### 2. Client (`client/.env.local`)
Create a `.env.local` file in the `client` folder with your Firebase Config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🖥️ Local Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CamScanner-project.git
cd CamScanner-project
```

### 2. Backend Setup

```bash
cd server
npm install
npm start
```

The server will run on [http://localhost:5000](http://localhost:5000).

### 3. Frontend Setup

Open a new terminal window and run:

```bash
cd client
npm install
npm run dev
```

The client will run on [http://localhost:5173](http://localhost:5173).

---

## 🚀 Deployment Guide

### Backend (Render.com)
1. Create a new Web Service on Render connected to this repo.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Environment Variables: Add all keys from your `server/.env`.

**Crucial**: For `FIREBASE_SERVICE_ACCOUNT`, paste the minified content of your `serviceAccountKey.json`.

**Note**: The backend is deployed on Render, which means it may take 40-60 seconds to become active. Please wait patiently while the server spins up.

### Frontend (Vercel)
1. Import the repo into Vercel.
2. Root Directory: `client`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables: Add all keys from your `client/.env.local`.

**Update API URL**: In `client/src/components/Dashboard.jsx`, replace `http://localhost:5000` with your deployed Render URL.

---

## 📂 Project Structure

```plaintext
CamScanner-project/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Dashboard, Login, etc.
│   │   ├── utils/          # Helper functions
│   │   └── firebase.js     # Firebase Client Config
│   └── vite.config.js
│
├── server/                 # Node.js Backend
│   ├── config/             # Cloudinary & Firebase Admin Config
│   ├── middleware/         # Auth Middleware
│   ├── utils/              # Image Processing Logic (Smart Crop)
│   └── server.js           # Main Entry Point
│
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.
