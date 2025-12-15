<div align="center">

# 🏥 PharmacyFinder

### Smart Pharmacy Locator & Medication Scanner

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

A full-stack MERN application that helps users locate nearby pharmacies, check real-time availability, scan medication barcodes, and access comprehensive drug information with intelligent routing powered by OSRM.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📸 Screenshots

| **Elegant Landing Page** | **Secure Authentication** |
|:---:|:---:|
| ![Landing Page](public/screenshots/home-light.png) | ![Login Page](public/screenshots/login-page.png) |
| *Modern, responsive design with quick access to features* | *Secure login with social auth integration* |

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [OSRM Setup](#osrm-setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🗺️ **Intelligent Pharmacy Discovery**

- **Geolocation-based search** with real-time distance calculation
- **Interactive map visualization** using Leaflet with custom markers
- **Advanced filtering** by on-duty status, opening hours, and distance
- **Smart routing** with turn-by-turn directions powered by OSRM
- **Cluster markers** for better map performance with large datasets

### 💊 **Medication Management**

- **Barcode scanning** using ZXing library for instant medication lookup
- **Comprehensive drug database** with detailed pharmaceutical information
- **Medication search** with autocomplete and fuzzy matching
- **Pharmacy inventory** showing medication availability by location

### 🔐 **User Authentication & Profiles**

- **Secure JWT-based authentication** with refresh token rotation
- **Google OAuth integration** for seamless social login
- **User profiles** with customizable preferences and favorites
- **Password recovery** via email with secure token validation
- **Role-based access control** (User/Admin)

### 🌍 **Localization & Accessibility**

- **Multi-language support** (English, French, Arabic) with RTL layout
- **Dark/Light theme** with system preference detection
- **Responsive design** optimized for mobile, tablet, and desktop
- **Progressive Web App** capabilities for offline access

### 🔒 **Security & Performance**

- **Rate limiting** to prevent API abuse
- **Helmet.js** for security headers
- **Input validation** with express-validator
- **CORS configuration** for cross-origin requests
- **MongoDB indexing** for optimized query performance
- **Request logging** with custom middleware

---

## 🛠️ Tech Stack

### **Frontend**

| Technology | Purpose |
|------------|---------|
| **React 18.3** | UI framework with hooks and context API |
| **Vite** | Lightning-fast build tool and dev server |
| **TailwindCSS** | Utility-first CSS framework with RTL support |
| **React Router v7** | Client-side routing with protected routes |
| **Leaflet** | Interactive maps with custom overlays |
| **Framer Motion** | Smooth animations and transitions |
| **Axios** | HTTP client with interceptors |
| **React Hot Toast** | Elegant toast notifications |
| **ZXing** | Barcode/QR code scanning |

### **Backend**

| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | JavaScript runtime |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database with Mongoose ODM |
| **JWT** | Stateless authentication |
| **bcrypt** | Password hashing |
| **Nodemailer** | Email service for notifications |
| **Google Auth Library** | OAuth 2.0 integration |
| **Express Rate Limit** | API throttling |
| **Helmet** | Security middleware |

### **Infrastructure**

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization for OSRM routing engine |
| **OSRM** | High-performance routing engine |
| **MongoDB Atlas** | Cloud database hosting (production) |
| **Git** | Version control |

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React SPA]
        B[Leaflet Maps]
        C[ZXing Scanner]
    end
    
    subgraph "API Layer"
        D[Express Server]
        E[JWT Middleware]
        F[Rate Limiter]
    end
    
    subgraph "Service Layer"
        G[Auth Service]
        H[Pharmacy Service]
        I[Routing Service]
        J[Medication Service]
    end
    
    subgraph "Data Layer"
        K[(MongoDB)]
        L[OSRM Engine]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> J
    H --> I
    G --> K
    H --> K
    J --> K
    I --> L
```

### **Key Design Patterns**

- **MVC Architecture**: Separation of concerns with models, controllers, and routes
- **Repository Pattern**: Data access abstraction through Mongoose models
- **Middleware Chain**: Request processing pipeline for auth, validation, and logging
- **Context API**: Global state management for auth, theme, and language
- **Protected Routes**: Client-side route guards with role-based access

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **MongoDB** >= 6.0 ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Docker** (for OSRM routing) ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/downloads))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ismailatif/PharmacyFinder.git
   cd PharmacyFinder
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```

### Environment Setup

#### **Frontend Environment** (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

#### **Backend Environment** (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pharmacy-finder
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pharmacy-finder

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@pharmacyfinder.com

# OSRM Configuration
OSRM_URL=http://localhost:5001

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

> **Security Note**: Never commit `.env` files to version control. Use `.env.example` as a template.

### OSRM Setup

The application uses OSRM (Open Source Routing Machine) for intelligent route calculation.

#### **Automated Setup (Windows)**

```powershell
cd backend/scripts
.\setup_osrm.ps1
```

#### **Manual Setup**

```bash
# Pull OSRM Docker image
docker pull osrm/osrm-backend

# Download Morocco map data (or your region)
cd backend/osrm-data
wget http://download.geofabrik.de/africa/morocco-latest.osm.pbf

# Process the map data
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/morocco-latest.osm.pbf
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/morocco-latest.osrm
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/morocco-latest.osrm

# Start OSRM server
docker run -t -i -p 5001:5000 -v "${PWD}:/data" --name osrm-morocco osrm/osrm-backend osrm-routed --algorithm mld /data/morocco-latest.osrm
```

#### **Verify OSRM is Running**

```bash
# Check Docker container
docker ps | grep osrm

# Test routing endpoint
curl "http://localhost:5001/route/v1/driving/-6.8498,33.9716;-6.8398,33.9816?overview=false"
```

---

## 💻 Usage

### **Development Mode**

1. **Start MongoDB** (if running locally)

   ```bash
   mongod
   ```

2. **Start OSRM** (if not already running)

   ```bash
   docker start osrm-morocco
   # Or check status: npm run osrm:check
   ```

3. **Start Backend Server**

   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

4. **Start Frontend Dev Server**

   ```bash
   npm run dev
   # App runs on http://localhost:5173
   ```

5. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`
   - API Health Check: `http://localhost:5000/api/health`

### **Production Build**

```bash
# Build frontend
npm run build

# Preview production build
npm run preview

# Start backend in production mode
cd backend
NODE_ENV=production npm start
```

---

## 📚 API Documentation

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login with credentials | ❌ |
| `POST` | `/api/auth/google` | Google OAuth login | ❌ |
| `POST` | `/api/auth/refresh-token` | Refresh access token | ❌ |
| `POST` | `/api/auth/logout` | Logout user | ✅ |
| `GET` | `/api/auth/me` | Get current user | ✅ |
| `POST` | `/api/auth/forgot-password` | Request password reset | ❌ |
| `POST` | `/api/auth/reset-password/:token` | Reset password | ❌ |

### **Pharmacy Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/pharmacies` | Get all pharmacies | ❌ |
| `GET` | `/api/pharmacies/:id` | Get pharmacy by ID | ❌ |
| `GET` | `/api/pharmacies/route` | Get route to pharmacy | ❌ |

### **Medication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/medications` | Search medications | ❌ |
| `GET` | `/api/medications/:id` | Get medication details | ❌ |
| `GET` | `/api/medications/barcode/:code` | Lookup by barcode | ❌ |

### **Example Request**

```javascript
// Get nearby pharmacies
const response = await axios.get('/api/pharmacies', {
  params: {
    lat: 33.9716,
    lng: -6.8498,
    limit: 20,
    onDuty: true
  }
});

// Get route to pharmacy
const route = await axios.get('/api/pharmacies/route', {
  params: {
    startLat: 33.9716,
    startLng: -6.8498,
    pharmacyId: 'pharmacy-123'
  }
});
```

---

## 📁 Project Structure

```
PharmacyFinder/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── pharmacyController.js
│   │   ├── routeController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── validation.js        # Input validation
│   │   ├── errorHandler.js      # Global error handler
│   │   └── logger.js            # Request logging
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Pharmacy.js          # Pharmacy schema
│   │   └── Medication.js        # Medication schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── pharmacies.js
│   │   └── medications.js
│   ├── services/
│   │   └── routingService.js    # OSRM integration
│   ├── scripts/
│   │   ├── setup_osrm.ps1       # OSRM setup script
│   │   └── seed_medications.cjs # Database seeding
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Entry point
│
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Navigation header
│   │   ├── PharmacyMap.jsx      # Leaflet map component
│   │   ├── PharmacyList.jsx     # Pharmacy listing
│   │   ├── Scanner.jsx          # Barcode scanner
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.jsx      # Auth state management
│   │   ├── ThemeContext.jsx     # Theme state
│   │   └── LanguageContext.jsx  # i18n state
│   ├── pages/
│   │   ├── SearchPage.jsx       # Main search interface
│   │   ├── ScannerPage.jsx      # Medication scanner
│   │   ├── LoginPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── ...
│   ├── utils/
│   │   └── api.js               # Axios instance
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
│
├── public/
│   ├── logo.png
│   └── auth-hero.jpg
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── QUICKSTART.md
└── README.md
```

---

## 🚢 Deployment

### **Frontend Deployment (Vercel/Netlify)**

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy to Vercel**

   ```bash
   npm i -g vercel
   vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID

### **Backend Deployment (Railway/Render/Heroku)**

1. **Set environment variables** on your hosting platform

2. **Deploy using Git**

   ```bash
   git push heroku main
   ```

3. **Ensure MongoDB Atlas is configured** for production database

### **OSRM Deployment**

For production, consider:

- **Self-hosted**: Deploy OSRM on a VPS with Docker
- **Cloud**: Use AWS ECS or Google Cloud Run for containerized OSRM
- **Alternative**: Use external routing APIs (Mapbox, GraphHopper)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### **Code Standards**

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ismail Atif**

- GitHub: [@ismailatif](https://github.com/ismailatif)
- Email: <ismail20020129@gmail.com>

---

## 🙏 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for map data
- [OSRM Project](http://project-osrm.org/) for routing engine
- [Geofabrik](https://www.geofabrik.de/) for OSM data extracts
- [Leaflet](https://leafletjs.com/) for mapping library
- [ZXing](https://github.com/zxing-js/library) for barcode scanning

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Ismail Atif](https://github.com/ismailatif)

</div>
