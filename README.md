# CamScanner - Intelligent Document Scanner

CamScanner is a full-stack web application that mimics the functionality of CamScanner. It allows users to upload document images, automatically detects and crops the document using intelligent image processing algorithms, and stores them securely in the cloud.

## 🚀 Features

* **Smart Auto-Crop:** Automatically detects document edges and crops background noise using a custom edge-density and center-weighted algorithm.
* **Image Processing:** Enhances image contrast and brightness for better readability.
* **Secure Cloud Storage:** Stores original and processed images on Cloudinary.
* **User Gallery:** Saves scan history per user using Firebase Firestore.
* **Authentication:** Secure Login and Signup via Firebase Authentication.
* **Drag & Drop Interface:** Easy-to-use frontend built with React and Tailwind CSS.
* **Responsive Design:** Works on desktop and mobile.

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* Tailwind CSS
* Firebase Auth (Client SDK)

**Backend:**
* Node.js & Express
* Jimp (Image Processing)
* Multer (File Uploads)
* Firebase Admin SDK (Firestore Database)
* Cloudinary SDK (Image Storage)

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
# Place your serviceAccountKey.json in server/config/
