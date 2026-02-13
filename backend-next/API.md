# DailySpark API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication

### Register
`POST /auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": { "id": 1, "email": "...", "name": "..." },
  "token": "jwt_token_here"
}
```

### Login
`POST /auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as Register.

## Words (Protected)
Requires `Authorization: Bearer <token>` header.

### Get Words
`GET /words`

**Response:** Array of words.

### Add Word
`POST /words`

**Body:**
```json
{
  "word": "epiphany",
  "meaning": "a moment of sudden revelation",
  "phonetic": "/əˈpifənē/",
  "partOfSpeech": "noun",
  "example": "He had an epiphany.",
  "level": "Advanced"
}
```

## Articles

### Get Articles
`GET /articles`
Query Params: `category`, `level`

### Add Article (Protected)
`POST /articles`

**Body:**
```json
{
  "title": "Learning English",
  "content": "Full text content...",
  "category": "Education",
  "level": "Intermediate"
}
```

## Database Schema
See `prisma/schema.prisma` for full details.
- **User**: Stores auth info.
- **Word**: User's vocabulary list.
- **Article**: Reading materials.

## Setup & Deployment
1. Configure `.env` with `DATABASE_URL`.
2. Run `npx prisma generate` to create client.
3. Run `npx prisma db push` to sync schema with DB.
4. `npm run dev` to start server.
