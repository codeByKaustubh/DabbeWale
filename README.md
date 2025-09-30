# DabbeWale

[Live Site: dabbewale.netlify.app](https://dabbewale.netlify.app/)

## Project Status
- **Frontend:** ✅ Live, modern UI/UX, responsive, user authentication, provider discovery, user info in profile dropdown.
- **Backend:** ✅ Node.js/Express/MongoDB API fully functional. User authentication, provider management, and order endpoints implemented and tested. JWT includes user name and email for improved UX.
- **Integration:** ✅ Frontend-backend integration complete. All forms/features connected to backend.
- **Branches:** `main`, `ishwari`

## Features
- ✅ Home page with branding and tagline
- ✅ User registration and login (frontend and backend)
- ✅ Provider registration and login (frontend and backend)
- ✅ Provider discovery (location-based, fully functional)
- ✅ Responsive design (mobile-friendly)
- ✅ Theme system (light/dark)
- ✅ Modern UI components
- ✅ Navigation system
- ✅ Form validation and design
- ✅ Accessibility features
- ✅ User info shown in profile dropdown after login
- ✅ Live deployment on Netlify
- ✅ Provider dashboard for managing services
- ✅ Order management system
- ✅ Real-time updates

## Tech Stack
- **Frontend:** HTML5, CSS3 (custom properties, responsive), JavaScript (ES6+)
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT authentication
- **Security:** bcrypt for password hashing, JWT tokens, CORS enabled
- **Deployment:** Netlify (frontend), render for backend
- **Version Control:** Git (branches: main, ishwari)

## How to Run

### Frontend
- Open `index.html` in your browser, or visit the [live site](https://dabbewale.netlify.app/).

### Backend
1. `cd dabbewala-backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```
4. Start server: `npm run dev` (for development with nodemon) or `npm start` (for production)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/provider/register` - Provider registration
- `POST /api/auth/provider/login` - Provider login

### Providers
- `GET /api/providers` - Get all providers
- `GET /api/providers/:id` - Get specific provider
- `PUT /api/providers/:id` - Update provider profile

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/provider/:providerId` - Get provider orders
- `PUT /api/orders/:id/status` - Update order status

## Environment Variables
Create a `.env` file in the `dabbewala-backend` directory:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dabbewale
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

## Project Structure
```
DabbeWale/
├── index.html (Home page)
├── login.html (User login)
├── register.html (User registration)
├── (removed) providers.html
├── provider-panel.html (Provider dashboard)
├── blog.html (Blog page)
├── about.html (About page)
├── assets/ (Images and static files)
├── frontend/
│   ├── css/style.css (Main stylesheet)
│   └── js/
│       ├── main.js (Main JavaScript)
│       └── provider-auth.js (Provider authentication)
└── dabbewala-backend/
    ├── server.js (Main server file)
    ├── config/db.js (Database configuration)
    ├── models/ (MongoDB models)
    ├── controllers/ (API controllers)
    ├── routes/ (API routes)
    └── middleware/ (Authentication middleware)
```

## Recent Updates
- ✅ Complete frontend-backend integration
- ✅ Provider authentication system
- ✅ Order management system
- ✅ Responsive design improvements
- ✅ Enhanced security with JWT
- ✅ Provider dashboard functionality
- ✅ Real-time order updates

## Future Enhancements
- Payment gateway integration
- Mobile app development
- Push notifications
- Rating and review system
- Order tracking enhancements
- Advanced search filters

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
