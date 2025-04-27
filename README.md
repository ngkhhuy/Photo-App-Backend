# Photo App Backend
A RESTful and real-time chat backend for a photo-sharing application built with Node.js, Express, MongoDB, and Socket.IO.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
  - [User Authentication](#user-authentication)
  - [Photo Management](#photo-management)
  - [Chat](#chat)
- [Socket.IO Events](#socketio-events)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features
- User registration & login with JWT (access & refresh tokens)
- Photo upload to Cloudinary via multer
- CRUD operations on photos (retrieve, like/unlike, delete, search)
- Real-time chat with Socket.IO and MongoDB persistence

## Tech Stack
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.IO
- Cloudinary
- JWT for authentication
- CORS, cookie-parser, dotenv

## Prerequisites
- Node.js v14+ and npm or Yarn
- MongoDB instance (local or Atlas)
- Cloudinary account for media storage

## Installation
```bash
git clone https://github.com/ngkhhuy/Photo-App-Backend.git
cd Photo-App-Backend
npm install
``` 

## Configuration
Create a `.env` file in the project root with the following variables:
```
PORT=5000
HOST=localhost
MONGODB_URI=mongodb://localhost:27017/photo-api
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
``` 

## Running the Server
```bash
# development mode with nodemon
npm run dev

# production
npm start
```
Server will run at `http://localhost:5000` by default.

## API Endpoints
Base URL: `/api/v1`

### User Authentication
| Method | Endpoint           | Description                      |
|--------|--------------------|----------------------------------|
| POST   | `/user/register`   | Register a new user              |
| POST   | `/user/login`      | Authenticate and receive tokens  |
| POST   | `/user/logout`     | Invalidate refresh token         |
| POST   | `/user/refresh`    | Refresh access token             |

### Photo Management
| Method | Endpoint                   | Description                            |
|--------|----------------------------|----------------------------------------|
| POST   | `/photos`                  | Upload a photo                         |
| GET    | `/photos`                  | List all photos                        |
| GET    | `/photos/:id`              | Get photo by ID                        |
| PATCH  | `/photos/:id/like`         | Toggle like/unlike on a photo          |
| DELETE | `/photos/:id`              | Delete a photo                         |
| GET    | `/photos/search?query=...` | Search photos by title or description |

### Chat
| Method | Endpoint              | Description                         |
|--------|-----------------------|-------------------------------------|
| POST   | `/chats`              | Create a new chat between users     |
| GET    | `/chats`              | Get all chats for authenticated user|
| GET    | `/chats/:chatId`      | Get messages for a specific chat    |

## Socket.IO Events
- **connection**: handshake and auth
- **chatMessage**: send message to a chat room
- **joinRoom**: join a chat room by ID
- **disconnect**: handle user disconnect

## Project Structure
```
Photo-App-Backend/
├── src/
│   ├── config/         # DB & Cloudinary setup
│   ├── controllers/    # Route handlers
│   ├── middlewares/    # Auth, validation, error handling
│   ├── models/         # Mongoose schemas
│   ├── providers/      # External services (Cloudinary)
│   ├── routes/         # Express routers
│   ├── services/       # Business logic
│   ├── sockets/        # Socket.IO handlers
│   ├── utils/          # Helpers & validators
│   ├── validations/    # Joi or custom validations
│   └── server.js       # App entrypoint
├── .env
├── .babelrc
├── package.json
└── README.md
```

## Contributing
Contributions are welcome! Please open issues or pull requests.

## License
MIT 2025 ngkhhuy