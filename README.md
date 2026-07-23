# AITasker Frontend (`swp391`)

A modern web application front-end built for AITasker, an AI-powered freelance marketplace connecting Clients, Technical Experts, and Admins. The frontend provides role-based user interfaces for project posting, service browsing, milestone tracking, real-time messaging, AI recommendations, dispute resolutions, and administration.

---

## Key Features

- **Authentication & Onboarding**: Email/password authentication, Google OAuth 2.0 integration, password reset flow, and role-specific onboarding (Client/Expert).
- **Client & Expert Dashboards**: Tailored navigation, project tracking, earnings overview, billing/invoice management, and service postings.
- **AI Marketplace & Search**: Advanced filtering, search for AI services & talent, and detailed proposal management.
- **Real-time Messaging & Notifications**: Integrated WebSocket setup (`useWebSocket`) and notification management (`useNotifications`).
- **Admin Management Panel**: Dashboard views for user management, dispute resolution, analytics, and content moderation.

---

## Tech Stack & External Packages

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Authentication**: [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- **UI Components & Icons**: [React-Bootstrap](https://react-bootstrap.github.io/), [Bootstrap 5](https://getbootstrap.com/), [Lucide React](https://lucide.dev/)
- **Linting & Quality**: ESLint

---

## Project Structure

```
AITasker-SWP/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images & visual assets
│   ├── Components/             # Reusable UI components grouped by feature
│   │   ├── Admin/              # Admin-specific modules (Analytics, Moderation, Disputes, Users)
│   │   ├── Client/             # Client modules (Active projects, Dashboards, Spending, Messages)
│   │   ├── Expert/             # Expert modules (Earnings, Contracts, Projects, Technical stack)
│   │   ├── Footer/             # Footer component & styling
│   │   ├── LandingPages/       # Public landing page sections & components
│   │   ├── marketplace/        # Service marketplace grid, cards, carousels, search
│   │   ├── Navbar/             # Header & notification bell components
│   │   ├── onboarding/         # Client & Expert onboarding multi-step forms
│   │   ├── Payment/            # Payment gateway dialogs
│   │   ├── Profile/            # Profile-related components
│   │   └── Settings/           # Account settings components
│   ├── hooks/                  # Custom React hooks (useWebSocket, useNotifications)
│   ├── pages/                  # Page components structured by feature/route
│   │   ├── auth/               # Login, Register, Forgot Password, Verification
│   │   ├── clients-experts/    # Search directory pages
│   │   ├── DashboardPage/      # Admin, Client, and Expert dashboard views
│   │   ├── marketplace/        # Task details, Service details, Proposal pages
│   │   ├── onboarding/         # Role onboarding page
│   │   ├── profile/            # Profile pages
│   │   └── projects/           # Detailed project views
│   ├── routes/                 # Routing configuration (AppRoutes.jsx)
│   ├── Services/               # API service modules for backend communication
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example                # Example environment variable file
├── index.html                  # HTML entry point
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd AITasker-SWP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the Development Server:
   ```bash
   npm run dev
   ```

5. Build for Production:
   ```bash
   npm run build
   ```
