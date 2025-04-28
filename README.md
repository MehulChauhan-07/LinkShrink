# LinkShrink - URL Shortener

A modern URL shortening service built with React, TypeScript, and Node.js.

## Key Features

- **User Authentication**: Secure signup/login system with JWT
- **URL Management**: Create, track, and manage shortened URLs
- **Comprehensive Analytics**: Track clicks, referrers, and user agents
- **QR Code Generation**: Generate QR codes for shortened URLs
- **Modern UI**: Built with Tailwind CSS and Shadcn UI

## Architecture

LinkShrink follows a domain-driven design architecture:

```
frontend/ - React + TypeScript frontend
backend/  - Express.js + MongoDB backend
```

### Backend Architecture

- **Domain-based structure**: Code organized by business domain
- **Service layer**: Business logic encapsulation
- **Repository pattern**: Data access abstraction
- **Middleware-based auth**: JWT authentication and role-based access control

### Frontend Architecture

- **React + TypeScript**: For type safety and better developer experience
- **React Query**: For data fetching and caching
- **Context API**: For global state management
- **React Router**: For client-side routing
- **TailwindCSS**: For styling

## API Documentation

The API is documented using OpenAPI/Swagger. When running in development mode, you can access the documentation at `http://localhost:3000/api-docs`.

### Key Endpoints

#### Authentication
- `POST /user/signup` - Create a new account
- `POST /user/login` - Login to account
- `GET /user/logout` - Logout

#### URL Management
- `POST /url` - Create a new short URL
- `GET /url` - Get all URLs for the current user
- `DELETE /url/:shortId` - Delete a URL
- `GET /url/analytics/:shortId` - Get analytics for a URL

## Development Setup

[rest of your existing setup instructions]

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

## Performance Considerations

- URL lookups are optimized with database indexes
- Frequently accessed URLs are cached in memory
- Request validation happens early in the request lifecycle

## Security Features

- JWT-based authentication
- CSRF protection
- Rate limiting on critical endpoints
- Input sanitization and validation