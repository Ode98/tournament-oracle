# Tournament Oracle (World Cup Predictor)

Tournament Oracle is a modern, interactive web application built to predict and track tournament outcomes. It provides a seamless interface for users to visualize brackets, make predictions, and engage with tournament data.

## Tech Stack

This project is built using a modern React ecosystem:

- **Frontend Framework:** React 19 with Vite
- **Routing:** TanStack Router
- **State Management:** TanStack Query & TanStack Form
- **UI Components:** Mantine (v9) & Lucide React for icons
- **Drag and Drop:** `@dnd-kit/react`
- **Backend / Database:** Supabase (PostgreSQL, Auth)
- **Deployment:** Docker (Caddy & Nginx)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- A Supabase project for backend services

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up your environment variables. Ensure you have your `.env` configured with your Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL (typically `http://localhost:5173`).

## Available Scripts

- `npm run dev` - Starts the Vite development server.
- `npm run build` - Compiles TypeScript and builds the project for production.
- `npm run preview` - Previews the production build locally.
- `npm run lint` - Runs ESLint to check for code issues.
- `npm run typegen` - Generates TypeScript types from the connected Supabase database schema.
