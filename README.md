# MERN Portfolio API

REST API for the Artem Lira portfolio website. The backend stores portfolio content in MongoDB and provides public read endpoints plus protected admin endpoints for managing projects, skills, contacts, media links, facts, and authentication.

Repository: [artemlira/MERN_Portfolio-back](https://github.com/artemlira/MERN_Portfolio-back)

Production API: [https://mern-portfolio-back.vercel.app](https://mern-portfolio-back.vercel.app)

Health check: [https://mern-portfolio-back.vercel.app/health](https://mern-portfolio-back.vercel.app/health)

Frontend website: [https://artem-lira.netlify.app](https://artem-lira.netlify.app)

Frontend repository: [artemlira/React-Portfolio_multipage](https://github.com/artemlira/React-Portfolio_multipage)

## Overview

This service is an Express and MongoDB API used by a React portfolio frontend. Public endpoints return portfolio content, while authenticated routes allow the portfolio owner to create, update, and delete content from the admin UI.

The API is configured for Vercel serverless deployment and local development.

## Features

- JWT authentication
- Password hashing with bcrypt
- MongoDB persistence via Mongoose
- CRUD endpoints for portfolio resources
- Protected write routes
- Request validation with express-validator
- MongoDB id validation for parameterized routes
- CORS allowlist for the production frontend and local development
- Security headers via Helmet
- Rate limiting for authentication and write requests
- Health endpoint for deployment checks
- Environment-based configuration

## Tech Stack

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JSON Web Tokens
- bcrypt
- express-validator
- cors
- helmet
- express-rate-limit
- dotenv
- Vercel

## Project Structure

```text
server/
  config.js             Environment-based application config
  index.js              Express app, middleware, routes, Vercel export
  controllers/          Route handlers
  models/               Mongoose schemas
  utils/                Auth and validation helpers
  validations.js        Request validation rules
  vercel.json           Vercel routing config
  .env.example          Required environment variable example
```

## Environment Variables

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required variables:

```env
MONGO_URI=mongodb+srv://user:password@cluster0.example.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=30d
CLIENT_ORIGINS=https://artem-lira.netlify.app,http://localhost:5173,http://127.0.0.1:5173
PORT=4444
```

`MONGO_URI` must include the database name. For this project the production database is `portfolio`:

```env
mongodb+srv://USER:PASSWORD@cluster0.jcpn6xu.mongodb.net/portfolio?retryWrites=true&w=majority
```

Alternative MongoDB configuration is also supported:

```env
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=portfolio
```

Do not commit real `.env` files or secrets.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:4444
```

Run the production entry locally:

```bash
npm start
```

## API Endpoints

### Health

```text
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

### Authentication

```text
POST /auth/login
POST /auth/register
GET  /auth/me
```

`/auth/me` requires an authorization token.

### Portfolio Content

Public read endpoints:

```text
GET /projects
GET /small
GET /skills
GET /contacts
GET /medias
GET /facts
```

Protected admin endpoints:

```text
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

POST   /small
GET    /small/:id
PATCH  /small/:id
DELETE /small/:id

POST   /skills
GET    /skills/:id
PATCH  /skills/:id
DELETE /skills/:id

POST   /contacts
GET    /contacts/:id
PATCH  /contacts/:id
DELETE /contacts/:id

POST   /medias
GET    /medias/:id
PATCH  /medias/:id
DELETE /medias/:id

POST   /facts
GET    /facts/:id
PATCH  /facts/:id
DELETE /facts/:id
```

## Authentication Notes

Authenticated requests must include the JWT token in the `Authorization` header.

If `JWT_SECRET` changes, all existing tokens become invalid and users must log in again.

## Deployment

The backend is deployed on Vercel.

Required Vercel environment variables:

```env
MONGO_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=30d
CLIENT_ORIGINS=https://artem-lira.netlify.app
```

After changing environment variables, redeploy the project. Existing deployments do not automatically pick up new variable values.

The root route `/` is not a website page. Seeing `Cannot GET /` is expected. Use `/health` to verify the API status.

## Quality Checks

Before deployment, run:

```bash
npm audit --audit-level=moderate
```

For a quick syntax check:

```bash
for file in index.js config.js validations.js controllers/*.js models/*.js utils/*.js; do node --check "$file" || exit 1; done
```

Current dependency audit passes with no moderate-or-higher npm vulnerabilities.

## Security Notes

- Real secrets are loaded from environment variables only.
- `passwordHash` is excluded from default user queries.
- CORS is restricted to configured origins.
- Write requests and auth requests are rate limited.
- Helmet applies standard HTTP security headers.
- MongoDB object ids are validated before controller execution.

## Future Improvements

- Move image storage from MongoDB base64 strings to Cloudinary, S3, Vercel Blob, or another object storage service.
- Add automated integration tests for authenticated CRUD routes.
- Add request logging with a production-friendly logger.
- Add role-based access control if more admin users are introduced.
