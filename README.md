# LeadFlow CRM - Manufacturing BDA Team Management Dashboard

LeadFlow CRM is a high-performance, production-ready MERN Stack application engineered specifically for manufacturing organizations. It equips Business Development Associates (BDAs) and Sales Managers with real-time tracking pipelines, interactive Kanban boards, detailed CRM lead tables, CSV spreadsheets exporting, and MoM sales growth charts.

The design aesthetics are inspired by premium collaboration and planning platforms such as **Jira** and **GoodDay Work**, featuring custom glassmorphic elements, modern dark mode support, and interactive responsive charts.

---

## Technical Architecture

### Frontend (Single Page Application)
- **React.js (Vite)**: Supercharged, lightweight SPA layer.
- **Tailwind CSS**: Custom color-tokens, rounded premium cards, and dark theme support.
- **React Router DOM**: Client routing with full Protected Route bindings.
- **Axios**: Service-driven HTTP client with automated Bearer-token request interceptors.
- **Recharts**: Responsive vector AreaCharts and PieCharts representing lead allocations.
- **React Icons**: Beautiful vectors from standard Lucide, Feather, and FontAwesome libraries.
- **React Hot Toast**: Real-time notifications for user CRUD operations.

### Backend (REST API Server)
- **Node.js & Express.js**: High-efficiency server applying strict Model-View-Controller (MVC) layers.
- **MongoDB Atlas & Mongoose**: Object modeling with strict schema validations and population lookups.
- **JWT (JSON Web Tokens)**: Secure token creation and auth verification middlewares.
- **bcryptjs**: Pre-save cryptographic hashing for database passwords.
- **dotenv & cors**: Production environmental control and cross-origin resource permissions.

---

## Folder Directory Structure

```
leadflow-crm/
 ├── client/                  # Vite + React Client App
 │    ├── src/
 │    │    ├── assets/        # Media assets
 │    │    ├── components/    # Reusable atomic UI elements
 │    │    ├── context/       # AuthContext global state providers
 │    │    ├── hooks/         # Custom hooks (e.g. useAuth)
 │    │    ├── layouts/       # Split AuthLayout & Sidebar DashboardLayout
 │    │    ├── pages/         # Login, Register, Dashboard, Leads, Pipeline, Profile
 │    │    ├── services/      # Fetch / Axios endpoints (auth, leads)
 │    │    ├── utils/         # Helper functions
 │    │    ├── App.jsx        # Route maps & Toaster definitions
 │    │    ├── index.css      # Tailwind core + glassmorphism custom layers
 │    │    └── main.jsx       # Root mount bindings
 │    ├── index.html          # Web head template linking Inter fonts
 │    ├── package.json        # Frontend script & packages dependencies
 │    ├── tailwind.config.js  # Color schemes & Dark theme breakpoints
 │    └── vite.config.js      # Port 3000 mapping + proxy to API server
 ├── server/                  # Node.js + Express Server
 │    ├── config/             # DB.js mongoose connections handler
 │    ├── controllers/        # Express request logic (authController, leadController)
 │    ├── middleware/         # authMiddleware (JWT decode) & errorMiddleware (graceful handlers)
 │    ├── models/             # Mongoose schemas (User.js, Lead.js)
 │    ├── routes/             # REST routing bounds (authRoutes, leadRoutes)
 │    ├── utils/              # Database seeder scripts
 │    ├── .env                # Env keys (PORT, MONGO_URI, JWT_SECRET)
 │    ├── package.json        # Server launch dependencies
 │    └── server.js           # Server startup script
 └── README.md                # Documentation Guide
```

---

## Database Schema Models

### 1. User Model (`server/models/User.js`)
- `name` (String, Required)
- `email` (String, Required, Unique, Lowercase, Trimmed)
- `password` (String, Required, Minlength 6, cryptographically hashed on pre-save)
- `role` (String, default: `'BDA'`, Enum: `['BDA', 'Manager', 'Admin']`)

### 2. Lead Model (`server/models/Lead.js`)
- `name` (String, Required Contact Person)
- `company` (String, Required Industrial/Manufacturing Buyer)
- `email` (String, Required Contact email)
- `phone` (String, Required Contact phone number)
- `status` (String, default: `'New'`, Enum: `['New', 'Contacted', 'Interested', 'Proposal Sent', 'Closed']`)
- `priority` (String, default: `'Medium'`, Enum: `['Low', 'Medium', 'High']`)
- `notes` (String text)
- `estimatedValue` (Number deal size, default: `0`)
- `assignedTo` (Mongoose ObjectId linking `User`, Required BDA owner)
- `followUpDate` (Date stamp, default: `null`)
- `createdBy` (Mongoose ObjectId linking `User`, Required)

---

## Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local server running or a MongoDB Atlas cluster URI)

### Step 1: Clone or extract codebase
Navigate to the root project folder:
```bash
cd leadflow-crm
```

### Step 2: Configure Server Environment variables
Create a `.env` file inside the `server` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/leadflow-crm
JWT_SECRET=supersecureleadflowcrmsecretkeyjwttoken12345
```
*(Replace `MONGO_URI` with your MongoDB Atlas cluster connection string if testing online).*

### Step 3: Run Backend Setup & Database Seeding
Navigate to the `server/` directory, install packages, and populate the database with realistic manufacturing demo leads:
```bash
cd server
npm install
npm run seed
```
This script clears existing entries and creates:
- **John Doe (BDA)**: `john@leadflow.com` (password: `password123`)
- **Sarah Connor (BDA)**: `sarah@leadflow.com` (password: `password123`)
- **Mike Tyson (BDA)**: `mike@leadflow.com` (password: `password123`)
- **Ashish Manager**: `manager@leadflow.com` (password: `password123`)
- **11 Realistic Manufacturing Leads** scoped across statuses, deal sizes up to $950,000, and followup metrics.

### Step 4: Run Frontend Setup
Open another terminal or navigate back and access the `client/` folder to install dependencies:
```bash
cd ../client
npm install
```

---

## Active Development Run Commands

### Start Backend API Server (Port 5000)
In the `/server` folder, launch the hot-reloading development server:
```bash
cd server
npm run dev
```

### Start Frontend Vite Server (Port 3000)
In the `/client` folder, launch the SPA development server:
```bash
cd client
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser. Vite’s reverse proxy will automatically relay any `/api` requests to the Express port 5000.

---

## Production API Endpoints Summary

### Authentication APIs (`/api/auth`)
| HTTP Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new BDA profile | Public |
| **POST** | `/api/auth/login` | Verify credentials & get JWT token | Public |
| **GET** | `/api/auth/me` | Fetch active user credentials | Private (JWT) |
| **GET** | `/api/auth/bdas` | Fetch a list of active BDAs | Private (JWT) |

### Leads APIs (`/api/leads`)
| HTTP Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/leads` | Retrieve leads list (Search, Filter, Sort, Pagination) | Private (JWT) |
| **POST** | `/api/leads` | Log a new sales business lead | Private (JWT) |
| **GET** | `/api/leads/stats` | Aggregate dashboard metrics and performance stats | Private (JWT) |
| **GET** | `/api/leads/:id` | Fetch specific lead details | Private (JWT) |
| **PUT** | `/api/leads/:id` | Edit lead information or pipeline status | Private (JWT) |
| **DELETE** | `/api/leads/:id` | Remove a lead from the database | Private (JWT) |

---

## Production Deployment Checklist

### 1. Build Client Asset Bundles
Compile optimized static HTML/CSS/JS assets inside `/client`:
```bash
npm run build
```
This generates a production folder at `/client/dist` which can be served statically by Express or uploaded to Netlify, Vercel, or AWS S3.

### 2. Configure Express to Serve Client Assets
To host both backend and frontend as a unified server on platforms like Render or Heroku, add static path bindings inside `server.js`:
```javascript
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}
```

### 3. Production Environment Checklist
- Change `.env` config: Set `NODE_ENV=production`.
- Secure CORS origin properties mapping exclusively to the production domain.
- Use a robust database connection (MongoDB Atlas cluster).
- Keep `JWT_SECRET` as a highly secured, complex crypt key.
