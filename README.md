# LinkShrink - URL Shortener

A modern URL shortening service built with React, TypeScript, and Node.js.

## Features

- User authentication (signup/login)
- URL shortening
- URL analytics
- Dashboard with statistics
- Modern UI with Tailwind CSS and Shadcn UI
- TypeScript for type safety
- React Query for data fetching
- Form validation with Zod

## Tech Stack

### Frontend

- React + Vite
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Router
- React Query
- Axios
- Zod
- React Hook Form

### Backend

- Node.js
- Express
- MongoDB
- JWT Authentication
- EJS (for email templates)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd linkshrink
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/url_shortener_jwt
JWT_SECRET=your_jwt_secret
```

## Running the Application

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## API Endpoints

### Authentication

- POST /user/signup - Create a new account
- POST /user/login - Login to account
- GET /user/logout - Logout

### URLs

- POST /url - Create a new short URL
- GET /url - Get all URLs for the current user
- DELETE /url/:shortId - Delete a URL
- GET /url/analytics/:shortId - Get analytics for a URL

## Development

### Backend

The backend is built with Express.js and uses MongoDB for data storage. It provides both API endpoints and serves the frontend application.

### Frontend

The frontend is built with React and TypeScript, using Vite as the build tool. It uses modern React patterns and libraries for a great developer experience.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
