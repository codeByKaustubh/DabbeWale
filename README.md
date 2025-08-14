# DabbeWale

[![Netlify Status](https://api.netlify.com/api/v1/badges/6e2e7e7e-xxxx-xxxx-xxxx-xxxxxxxxxxxx/deploy-status)](https://dabbewale.netlify.app/)
![Node.js](https://img.shields.io/badge/node-%3E=14.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

[Live Site: dabbewale.netlify.app](https://dabbewale.netlify.app/)

## Project Status
- **Frontend:** Live, modern UI/UX, responsive, user authentication, provider discovery, user info in profile dropdown.
- **Backend:** Node.js/Express/MongoDB API in progress. User authentication, provider management, and order endpoints being built and tested. JWT now includes user name and email for improved UX.
- **Integration:** Frontend-backend integration ongoing. Some forms/features not yet connected to backend.
- **Branches:** `main`, `ishwari`

## Features
- Home page with branding and tagline
- User registration and login (frontend and backend)
- Provider discovery (location-based, UI implemented)
- Responsive design (mobile-friendly)
- Theme system (light/dark)
- Modern UI components
- Navigation system
- Form validation and design
- Accessibility features
- User info shown in profile dropdown after login
- Live deployment on Netlify

## Tech Stack
- **Frontend:** HTML5, CSS3 (custom properties, responsive), JavaScript
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT authentication
- **Deployment:** Netlify (frontend), render for backend
- **Version Control:** Git (branches: main, ishwari)

## How to Run

### Frontend
- Open `index.html` in your browser, or visit the [live site](https://dabbewale.netlify.app/).

### Backend
1. `cd dabbewala-backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with MongoDB URI and JWT secret
4. Start server: `npm run dev` (for development) or `npm start` (for production)

## Notes
- User's name now appears in the profile dropdown after login (improved JWT payload)
- Focus on user experience, modern design, and robust backend foundation
- Advanced features (ordering, payments, admin, analytics, mobile app) are planned for future phases
