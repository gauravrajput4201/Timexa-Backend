# Timexa Backend - Production Ready Login API

## 🚀 Features

- ✅ Simple Login API with email/password
- ✅ MongoDB Integration with Mongoose
- ✅ DTO Validation with class-validator
- ✅ Swagger API Documentation
- ✅ Environment Configuration
- ✅ Production-ready setup with CORS
- ✅ TypeScript & NestJS

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or remote)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   
   Create a `.env` file (or use the existing one) and configure:
   ```env
   MONGODB_URI=mongodb://localhost:27017/timexa
   PORT=3000
   NODE_ENV=development
   ```

3. **Start MongoDB:**
   
   Make sure MongoDB is running on your system:
   ```bash
   # macOS (if installed via Homebrew)
   brew services start mongodb-community
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The application will be available at:
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/docs

## 📚 API Documentation

### Login Endpoint

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

## 🧪 Testing the API

### 1. Create a Test User in MongoDB

Connect to MongoDB and insert a test user:

```bash
mongosh

use timexa

db.users.insertOne({
  email: "test@example.com",
  password: "password123",
  name: "Test User",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 2. Test with cURL

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Test with Swagger UI

1. Navigate to http://localhost:3000/docs
2. Find the `/auth/login` endpoint under "Authentication" tag
3. Click "Try it out"
4. Enter credentials and execute

## 🗂️ Project Structure

```
src/
├── api/
│   └── auth/
│       ├── dto/
│       │   ├── login.dto.ts           # Login request DTO
│       │   └── login-response.dto.ts  # Login response DTO
│       ├── schemas/
│       │   └── user.schema.ts         # MongoDB User schema
│       ├── auth.controller.ts         # Auth endpoints
│       ├── auth.service.ts            # Auth business logic
│       └── auth.module.ts             # Auth module
├── app.module.ts                      # Main app module
└── main.ts                            # Application entry point
```

## 🔒 Security Notes

⚠️ **Important:** This implementation uses plain text password comparison for simplicity. 

**For production, you should:**
1. Hash passwords using bcrypt
2. Implement JWT tokens
3. Add rate limiting
4. Use HTTPS only
5. Implement refresh tokens
6. Add password complexity requirements

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/timexa` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## 🛠️ Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run lint` - Lint the code
- `npm run test` - Run tests

## 📦 Dependencies

- **@nestjs/common** - NestJS common module
- **@nestjs/core** - NestJS core
- **@nestjs/mongoose** - Mongoose integration
- **@nestjs/swagger** - Swagger/OpenAPI documentation
- **@nestjs/config** - Configuration module
- **mongoose** - MongoDB ODM
- **class-validator** - DTO validation
- **class-transformer** - Object transformation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

UNLICENSED
