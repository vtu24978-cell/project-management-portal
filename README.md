# Mini Project Management Portal

A robust, premium full-stack task management web application built as an **o2h Full Stack Application Developer Assessment**. The portal enables users to manage project tasks, track status transitions, search and sort, and view dashboard statistics. It incorporates secure JWT-based user authentication, complete input validations, and light/dark theme toggle settings.

The project is structured and styled using a clean, modern design system powered by **React (Vite)** on the frontend and **Node.js/Express** on the backend, using **Sequelize ORM** for database interaction.

---

## 🚀 Features

### Core Requirements
- **Dashboard Grid**: Cards displaying task title, description, status badges, and creation dates.
- **Task Creation Page**: Dedicated page with instant form validations (e.g. description minimum 20 characters, title required).
- **Task State Transitions**: Actions to transition tasks between *Pending*, *In Progress*, and *Completed*.
- **Task Deletion**: Allows users to remove tasks permanently.
- **Status Filtering**: Filter dashboard tasks dynamically by their current state.
- **Responsiveness**: Mobile-friendly grids and custom styles.
- **Micro-Animations**: Clean hover translations, card shadow expands, list fade-ins, and skeleton loaders.

### Advanced Features (Included)
- **User Authentication**: Complete login and registration flows utilizing JWT (JSON Web Tokens) with passwords securely salted/hashed using Bcrypt.
- **Search Engine**: Real-time debounced database query matching task titles and descriptions.
- **Sort Filters**: Sorting tasks by date (Newest First vs. Oldest First).
- **Dashboard Stats Banner**: Live counters indicating Total, Pending, In Progress, and Completed tasks for the current user.
- **Paging Controls**: Optimized backend pagination (`limit: 6` per page) with page navigators.
- **Theme Toggle**: Dual light and dark modes utilizing CSS variables, persisting local preference in LocalStorage.
- **Unit / Integration Tests**: Backend test suite covering controllers, route protection, and database isolation.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Axios, Lucide React (Icons), Vanilla CSS (Custom Design System)
- **Backend**: Node.js, Express, Sequelize (ORM), JWT, BcryptJS, Jest, Supertest
- **Database**: SQLite (Default - zero config) or MySQL (Fully compatible via environment variables)

---

## 📂 Project Structure

```text
project-root/
│
├─ backend/
│  ├─ config/         # Sequelize connection configuration
│  ├─ controllers/    # Controller logic (auth, tasks)
│  ├─ middleware/     # Auth checks & global error handling
│  ├─ models/         # Sequelize schemas (User, Task)
│  ├─ routes/         # API endpoints definitions
│  ├─ tests/          # Jest & Supertest API tests
│  ├─ .env.example    # Configuration template
│  ├─ server.js       # Entry point
│  └─ package.json
│
├─ frontend/
│  ├─ src/
│  │  ├─ components/  # Nav, Stats, Cards, Loading skeleton, Empty state
│  │  ├─ pages/       # Login, Register, Dashboard, AddTask
│  │  ├─ services/    # Axios client and API wrappers
│  │  ├─ App.jsx      # Client routing & protected routes
│  │  ├─ index.css    # Core styling & variables (dark/light themes)
│  │  └─ main.jsx
│  └─ package.json
│
├─ README.md
└─ .gitignore
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- Git

### 1. Repository Setup
Clone and navigate to the project directory:
```bash
git clone <repository-url>
cd project-root
```

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Set up the environment file:
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - The default configuration uses an **SQLite database**, creating a `database.sqlite` file in the backend root directory. This enables the server to run out-of-the-box with **zero database setup**.
4. Run Backend Integration Tests:
   ```bash
   npm run test
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.

### 3. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application is now accessible at `http://localhost:5173`.

---

## 🛢️ MySQL Migration (Optional)

To switch the database engine from SQLite to MySQL:
1. Ensure your local MySQL server is running.
2. Edit the `.env` file in the `backend/` directory:
   - Change `DB_DIALECT=mysql`
   - Uncomment the MySQL environment variables and configure your server credentials:
     ```env
     DB_DIALECT=mysql
     DB_HOST=localhost
     DB_USER=your_mysql_user
     DB_PASS=your_mysql_password
     DB_NAME=your_database_name
     ```
3. Create the database on your MySQL server matching the `DB_NAME` value.
4. Restart the backend server. Sequelize will automatically sync and construct the tables (`Users` and `Tasks`).

---

## 📖 API Documentation

All request bodies must be JSON, and protected routes require a Bearer token in the `Authorization` header: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Endpoints
#### Register User
- **URL**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5c..."
  }
  ```

#### Login User
- **URL**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5c..."
  }
  ```

---

### Task Endpoints (Protected)
#### Retrieve Tasks
- **URL**: `GET /api/tasks`
- **Query Parameters (Optional)**:
  - `status` (`Pending` | `In Progress` | `Completed`)
  - `search` (Search term for title/description)
  - `page` (Page number, default `1`)
  - `limit` (Items per page, default `6`)
  - `sortBy` (Default `createdAt`)
  - `order` (`ASC` | `DESC`, default `DESC`)
- **Response (200 OK)**:
  ```json
  {
    "tasks": [
      {
        "id": 4,
        "title": "Build API Endpoints",
        "description": "Develop Express routers and controllers for tasks.",
        "status": "In Progress",
        "createdAt": "2026-06-19T14:15:00.000Z",
        "updatedAt": "2026-06-19T14:15:00.000Z",
        "userId": 1
      }
    ],
    "pagination": {
      "totalItems": 1,
      "totalPages": 1,
      "currentPage": 1,
      "limit": 6
    },
    "stats": {
      "total": 3,
      "pending": 1,
      "inProgress": 1,
      "completed": 1
    }
  }
  ```

#### Create Task
- **URL**: `POST /api/tasks`
- **Request Body**:
  ```json
  {
    "title": "Build Login Page",
    "description": "Create a responsive login page with form validations.",
    "status": "Pending"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 5,
    "title": "Build Login Page",
    "description": "Create a responsive login page with form validations.",
    "status": "Pending",
    "userId": 1,
    "createdAt": "2026-06-19T14:18:22.000Z",
    "updatedAt": "2026-06-19T14:18:22.000Z"
  }
  ```

#### Update Task
- **URL**: `PUT /api/tasks/:id`
- **Request Body**:
  ```json
  {
    "status": "Completed"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 5,
    "title": "Build Login Page",
    "description": "Create a responsive login page with form validations.",
    "status": "Completed",
    "userId": 1,
    "createdAt": "2026-06-19T14:18:22.000Z",
    "updatedAt": "2026-06-19T14:22:45.000Z"
  }
  ```

#### Delete Task
- **URL**: `DELETE /api/tasks/:id`
- **Response (200 OK)**:
  ```json
  {
    "message": "Task deleted successfully",
    "id": "5"
  }
  ```

---

## 📝 Design Decisions & Assumptions

1. **Sequelize ORM & SQLite Default**: Selected Sequelize as it offers multi-dialect support (SQLite, MySQL, Postgres, MSSQL). Providing SQLite configuration by default allows the assessor to run tests and launch the portal instantaneously without database installs or custom configuration.
2. **User Workspace Isolation**: To replicate production systems, the tasks are linked to the currently authenticated user (`userId`). Users cannot read, modify, or delete tasks belonging to other accounts.
3. **Vanilla CSS variables for Theming**: Avoided installing complex CSS UI frameworks in favor of semantic CSS variables. This ensures lightweight stylesheets, layout consistency, and seamless animation effects while keeping styling modifications quick.
4. **Description Character Count**: Validations are enforced on both the backend models and frontend forms. Minimizing visual interruptions, the UI displays a reactive character count when typing descriptions.
5. **Combined Paginated Endpoint**: Integrated statistics counters directly inside the GET `/api/tasks` paginated payload. This prevents multiple API roundtrips and guarantees that dashboard stat boxes are synchronized with client filtering and changes.
