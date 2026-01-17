# SkillSwap Project - Technical Deep Dive & Interview Guide

This document explains the technical architecture, design decisions, and code flow of the SkillSwap application. Use this to prepare for your interview.

## 1. Architecture Overview

The application follows a standard **Client-Server Architecture**.

*   **Frontend (The "Client")**: Built with **React** (using Vite). It handles the user interface, animations (Framer Motion), and user state.
*   **Backend (The "Server")**: Built with **Spring Boot**. It handles business logic, security, and database interactions.
*   **Database**: **MySQL** (implied by the driver, currently running against your local setup).

## 2. Backend (Spring Boot) Explained

### Key Concepts

#### A. Security (JWT - JSON Web Token)
Instead of using sessions (where the server remembers the user), we use **Takens**.
1.  **User Logs in**: Sends email/password to `/api/auth/login`.
2.  **Server Verifies**: Checks database. If it matches, generates a **JWT String** (encrypted) containing the user's email.
3.  **Token Return**: server returns this token to React.
4.  **React Stores it**: React saves it in `localStorage`.
5.  **Subsequent Requests**: React attaches this token to the header (`Authorization: Bearer <token>`) of every request (like "Get Resources").
6.  **Server Validates**: The `JwtAuthenticationFilter` intercepts the request, decodes the token, and allows access if valid.

**Files to know:**
*   `SecurityConfig.java`: The "gatekeeper". Defines which URLs are public (`/api/auth/**`) and which are private.
*   `JwtAuthenticationFilter.java`: The "security guard". Checks every request for the pass (Token).
*   `JwtUtils.java`: The "stamp maker". Creates and reads the tokens.

#### B. Layers
1.  **Controller (`UserController`, `ResourceController`)**: The "Waiter". Takes the order (HTTP Request) and gives it to the kitchen (Service).
2.  **Service (`UserService`, `ResourceService`)**: The "Chef". Contains business logic (e.g., "Check if email exists", "encrypt password").
3.  **Repository (`UserRepository`, `ResourceRepository`)**: The "Pantry". Directly talks to the Database using JPA (Hibernate).
4.  **Model/Entity (`User`, `Resource`)**: The "Menu Items". Defines what the data looks like (tables in the DB).

## 3. Frontend (React) Explained

### Key Concepts

#### A. State Management (Context API)
We used `AuthContext.jsx` to create a "Global State" for the user.
*   **Why?** So that `Navbar`, `Profile`, and `Marketplace` all know *who* is logged in without passing props down 10 levels.
*   **How?** It wraps the entire app (`Previous <AuthProvider>`) and provides `user` and `login/logout` functions to any component that asks for them.

#### B. Proxying (`vite.config.js`)
*   React runs on port `5173`. Spring Boot runs on `8084`.
*   Browsers block requests between different ports (CORS).
*   We set up a **Proxy**: When React asks for `/api/...`, Vite forwards it to `http://localhost:8084`. This makes the browser think it's talking to the same server.

#### C. Animations
We used **Framer Motion** (`<motion.div>`) to add "wow" factor (glassmorphism cards, flip effects in Marketplace) without complex CSS keyframes.

## 4. Interview "Elevator Pitch"

"I built SkillSwap as a full-stack hyper-local resource exchange platform.
On the **Backend**, I engineered a robust REST API using **Spring Boot**. I implemented custom security using **JWT (JSON Web Tokens)** and Spring Security to ensure stateless authentication. I used **Spring Data JPA** for efficient ORM mapping to MySQL, managing complex relationships between Users and Resources.

On the **Frontend**, I built a responsive SPA (Single Page Application) using **React**. I utilized **Context API** for global state management (specifically for auth flow) and **Framer Motion** for high-performance animations like the glassmorphic flip-cards. I also configured a proxy server in Vite to handle CORS issues seamless during development."

## 5. Potential Interview Questions

*   **Q: Why use JWT instead of Sessions?**
    *   *A: JWT allows the app to be stateless and scale better. It also makes it easier if we ever want to build a mobile app backened by the same API.*
*   **Q: How do you handle passwords?**
    *   *A: I use `BCryptPasswordEncoder` in Spring Security to hash passwords before saving them to the database. We never store plain text passwords.*
*   **Q: How does the "Flip Card" work?**
    *   *A: It uses CSS 3D transforms controlled by React state (`isFlipped`). Framer Motion handles the interpolation of the rotation from 0 to 180 degrees.*
