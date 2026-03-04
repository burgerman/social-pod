# Gemini Code Assist Context

This document provides context for the Gemini Code Assist extension to understand the `social-pod` project.

## Project Overview

`social-pod` is a web application built with Next.js and TypeScript. It is a social platform centered around "pods" or groups, featuring user authentication, profiles, and group functionalities. The project uses Supabase for its backend and database, and Tailwind CSS for styling. It is also configured as a Progressive Web App (PWA).

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (v15) with the App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Supabase](https://supabase.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **PWA**: Enabled via `next-pwa`
- **API Clients**: 
  - `groq-sdk` for AI features.
  - `@rive-app/react-canvas` for Rive animations.
- **Authentication**: `@supabase/auth-helpers-nextjs` for server-side authentication.
- **UI Components**: 
  - `react` and `react-dom` for building user interfaces.

## Project Structure

- `app/`: The core of the Next.js application using the App Router.
  - `app/api/`: Contains server-side API routes.
    - `generate-plan/`: API for plan generation.
    - `taste-navigator/`: API for taste navigation.
  - `app/auth/`: Handles user authentication (login, signup).
  - `app/components/`: Contains shared, reusable React components like `Navbar.tsx`.
  - `app/dashboard/`: The user's main dashboard page.
  - `app/grouppods/`: Feature related to social groups or "pods".
  - `app/profile/`: User profile page.
  - `app/supabaseClient.ts`: Initializes the Supabase client for database and auth interactions.
  - `app/layout.tsx`: The main layout file for the application.
  - `app/page.tsx`: The main landing page.
- `public/`: Static assets like images, fonts, and icons.
- `package.json`: Defines project scripts and dependencies.
- `next.config.ts`: Configuration file for Next.js, including PWA settings.
- `tailwind.config.ts`: Configuration for Tailwind CSS.
- `tsconfig.json`: TypeScript compiler options.

## Key Features

- **User Authentication**: Secure login and signup functionality using Supabase Auth.
- **Group Pods**: Users can create and join "pods" to interact with others.
- **AI-Powered Features**: 
  - **Plan Generation**: The `/api/generate-plan` endpoint suggests the app uses AI to generate plans.
  - **Taste Navigator**: The `/api/taste-navigator` endpoint suggests an AI-powered feature for personalized recommendations.
- **Interactive UI**: The app uses Rive for animations, providing a rich user experience.
- **Progressive Web App (PWA)**: The application can be installed on a user's device for an app-like experience.

## How to Run the Project

- **Install Dependencies**:
  ```bash
  npm install
  ```
- **Run Development Server**:
  The project uses Turbopack for faster development.
  ```bash
  npm run dev
  ```
- **Build for Production**:
  ```bash
  npm run build
  ```
- **Start Production Server**:
  ```bash
  npm run start
  ```
- **Lint the Code**:
  ```bash
  npm run lint
  ```

