# jpic-server

REST API behind **jpic**, a photography portfolio site. It handles user accounts, JWT authentication, role-based access (admin / user), and photo uploads with metadata.

## Tech stack

- **Node.js** + **Express**
- **MongoDB** with **Mongoose** schemas
- **JWT** (`jsonwebtoken`) for stateless auth, **bcrypt** password hashing via a Mongoose `pre('save')` hook
- **Multer** for multipart image uploads

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/register` | Create a user (password is hashed before save) |
| `POST` | `/api/users/login` | Verify credentials and return a signed JWT (1h expiry) |
| `GET` | `/api/users?<id>` | Fetch a user by id |
| `POST` | `/api/photos` | Upload a photo (`multipart/form-data`: `photo`, `title`, `description`, `category`) |
| `GET` | `/api/photos` | List all photos |
| `GET` | `/uploads/:file` | Serve uploaded image files |

Auth middleware (`protect`, `admin`) verifies the `Authorization: Bearer <token>` header and loads the user for role checks.

## Getting started

```bash
npm install
cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm start              # http://localhost:5001
```

## Environment variables

| Name | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `PORT` | Server port (default `5001`) |
