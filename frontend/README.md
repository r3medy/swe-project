# Frontend - Freelance Platform

A modern React-based frontend for a freelance marketplace platform where clients can post jobs and freelancers can submit proposals.

## 🛠️ Tech Stack

- **React 19** - UI library with latest features including the `use()` hook
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Hot Toast** - Toast notifications
- **Zod** - Schema validation for forms
- **React Icons** - Icon library
- **React Country Flag** - Country flag components

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/           # Static assets (images, illustrations)
│   ├── components/       # Reusable UI components
│   │   ├── Navigation/   # Navigation with compound components
│   │   └── ...           # Button, Input, Drawer, Table, etc.
│   ├── contexts/         # React contexts (Session, Theme)
│   ├── models/           # Zod validation schemas
│   ├── pages/            # Page components
│   │   ├── Chat/         # Real-time chat
│   │   ├── Home/         # Landing page
│   │   ├── Login/        # Authentication
│   │   ├── Register/     # User registration
│   │   ├── Onboarding/   # New user setup
│   │   ├── Profile/      # User profiles
│   │   ├── Wall/         # Job listings
│   │   ├── Proposals/    # Client proposal management
│   │   ├── NewPost/      # Create job posts
│   │   ├── Pending/      # Admin post moderation
│   │   ├── UsersControlPanel/  # Admin user management
│   │   └── TagsControlPanel/   # Admin tag management
│   ├── config.js         # API configuration
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
└── vite.config.js        # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API URL (defaults to localhost:8000 if not set)
VITE_API_URL=http://localhost:8000
```

## 📜 Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## 🎨 Features

### User Roles

- **Client** - Post jobs, review proposals, hire freelancers
- **Freelancer** - Browse jobs, submit proposals, chat with clients
- **Admin** - Moderate posts, manage users and tags

### Core Features

- 🔐 **Authentication** - Login, register, session management
- 👤 **Profiles** - View/edit profiles, profile pictures
- 📝 **Job Posts** - Create, browse, save, filter jobs
- 📨 **Proposals** - Submit and manage proposals
- 💬 **Chat** - Real-time messaging between users
- 🏷️ **Tags** - Categorize jobs by skills/interests
- 🌙 **Dark Mode** - Theme switching support

### Admin Features

- Approve/reject pending posts
- Edit post content
- Manage users (CRUD operations)
- Manage tags

## 🏗️ Architecture

### State Management

- **SessionContext** - User authentication state
- **ThemeContext** - Dark/light mode preference
- Custom hooks for complex state (useChat, useWall, useNavigation)

### Component Patterns

- **Compound Components** - Navigation, Button variants, SmallText badges
- **Memoization** - React.memo, useMemo, useCallback for performance
- **Extracted Components** - Separated presentational logic

### API Integration

All API calls use the centralized `config.js`:

```javascript
import { API_BASE_URL, assetUrl } from "@/config";

// API call
fetch(`${API_BASE_URL}/auth/login`, { ... });

// Asset URL
<img src={assetUrl(user.profilePicture)} />
```

## 🚢 Deployment

### Production Build

```bash
npm run build
```

Output will be in the `dist/` folder.

### Environment Setup

Create `.env.production`:

```env
VITE_API_URL=https://your-api-domain.com
```

### Hosting Recommendations

- **Vercel** - Zero-config deployment, automatic HTTPS
- **Netlify** - Similar to Vercel, great for static sites
- **Cloudflare Pages** - Fast global CDN

## 📄 License

This project is part of a software engineering course project.
