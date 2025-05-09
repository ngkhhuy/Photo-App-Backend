# Photo App Backend
A RESTful and real-time chat backend for a photo-sharing application built with Node.js, Express, MongoDB, and Socket.IO.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Deployment with Docker on AWS EC2](#deployment-with-docker-on-aws-ec2)
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
# Development mode with nodemon (auto-restarts on file changes)
npm run dev

# Production mode (builds the project first, then runs)
npm run production
```
The server will run at `http://<LOCAL_DEV_APP_HOST>:<LOCAL_DEV_APP_PORT>` (e.g., `http://0.0.0.0:3000` or `http://localhost:3000`) by default.

## Deployment with Docker on AWS EC2

This project includes a `Dockerfile` for containerizing the application, making it easy to deploy on platforms like AWS EC2.

### Prerequisites for Docker Deployment:
-   Docker installed on your local machine (for building the image).
-   AWS Account and AWS CLI configured (if pushing to Amazon ECR).
-   An EC2 instance set up with Docker installed.

### General Steps:

1.  **Build the Docker Image:**
    Navigate to the project root directory and run:
    ```bash
    docker build -t photo-api-backend .
    ```
    (Replace `photo-api-backend` with your desired image name).

2.  **Push to a Container Registry (Recommended, e.g., Amazon ECR):**
    *   Create a repository in Amazon ECR.
    *   Authenticate Docker with ECR.
    *   Tag your image: `docker tag photo-api-backend:latest YOUR_ECR_REPOSITORY_URI:latest`
    *   Push your image: `docker push YOUR_ECR_REPOSITORY_URI:latest`

3.  **Run the Container on EC2:**
    *   SSH into your EC2 instance.
    *   Pull the image if you pushed it to ECR: `docker pull YOUR_ECR_REPOSITORY_URI:latest`
    *   Prepare an environment file (e.g., `backend.env`) on your EC2 instance with all the necessary environment variables (see [Configuration](#configuration) section, but ensure `LOCAL_DEV_APP_HOST` is `0.0.0.0`).
    *   Run the Docker container:
        ```bash
        docker run -d \
          --name photoapp-backend-container \
          -p <HOST_PORT>:<CONTAINER_PORT> \
          --env-file ./backend.env \
          --restart always \
          YOUR_ECR_REPOSITORY_URI:latest # Or your local image name if not using ECR
        ```
        Replace `<HOST_PORT>` with the port you want to expose on the EC2 instance (e.g., 80 or 3000) and `<CONTAINER_PORT>` with the port your application runs on inside the container (e.g., 3000, as defined by `LOCAL_DEV_APP_PORT` or `PORT` in your `.env` / `backend.env`). Ensure your EC2 instance's security group allows inbound traffic on `<HOST_PORT>`.

Refer to the `Dockerfile` in the repository for build specifics. For detailed EC2 and Docker setup, consult the official AWS and Docker documentation.

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