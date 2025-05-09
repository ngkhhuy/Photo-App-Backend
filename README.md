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
- User registration & login with JWT (access & refresh tokens stored in HTTP-only cookies)
- Password reset functionality (request code via email, reset password)
- Photo upload to Cloudinary
- CRUD operations on photos (retrieve, like/unlike, delete, search)
- Control photo visibility (public/private)
- Retrieve photos uploaded by the authenticated user ("my photos")
- Real-time chat with Socket.IO and MongoDB persistence

## Tech Stack
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.IO
- Cloudinary for image storage
- JWT (JSON Web Tokens) for authentication
- bcrypt for password hashing
- Nodemailer for sending emails (e.g., password reset)
- Babel for ES6+ JavaScript transpilation
- CORS, cookie-parser, dotenv

## Prerequisites
- Node.js v18.x or higher (as per `package.json`) and npm or Yarn
- MongoDB instance (local or a cloud service like MongoDB Atlas)
- Cloudinary account for media storage
- An email account (e.g., Gmail with an "App Password" if 2FA is enabled) for sending password reset emails via Nodemailer.

## Installation
```bash
git clone https://github.com/ngkhhuy/Photo-App-Backend.git # Or your repository URL
cd Photo-App-Backend
npm install
```

## Configuration
Create a `.env` file in the project root with the following variables (refer to your `.env` file for actual values):
```properties
# Server Configuration
LOCAL_DEV_APP_PORT=3000
LOCAL_DEV_APP_HOST=0.0.0.0

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets
ACCESS_TOKEN_SECRET_SIGNATURE=your_strong_access_token_secret
REFRESH_TOKEN_SECRET_SIGNATURE=your_strong_refresh_token_secret

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (for password reset, etc.)
EMAIL_USERNAME=your_email_address_for_sending_mail
EMAIL_PASSWORD=your_email_password_or_app_password
EMAIL_FROM=your_email_address_emails_will_be_sent_from
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
Base URL: `/v1`

### User Authentication
| Method | Endpoint                | Description                                  | Auth Required |
|--------|-------------------------|----------------------------------------------|---------------|
| POST   | `/users/register`       | Register a new user                          | No            |
| POST   | `/users/login`          | Authenticate and receive tokens in cookies   | No            |
| DELETE | `/users/logout`         | Clear authentication cookies                 | No            |
| PUT    | `/users/refresh_token`  | Refresh access token (logic might be TBD)    | Yes (implicitly via refresh token cookie) |
| POST   | `/users/forgot-password`| Request a password reset code via email      | No            |
| POST   | `/users/reset-password` | Reset password using the code and new password | No            |

### Photo Management
| Method | Endpoint                   | Description                                     | Auth Required |
|--------|----------------------------|-------------------------------------------------|---------------|
| POST   | `/photos/upload`           | Upload a photo (expects 'image' multipart/form-data) | Yes           |
| GET    | `/photos`                  | List all public photos and user's own photos (if authenticated) with pagination | Optional      |
| GET    | `/photos/my-photos`        | List photos uploaded by the authenticated user with pagination | Yes           |
| GET    | `/photos/search`           | Search photos by description or keywords (query param: `query`) | Optional      |
| GET    | `/photos/:id`              | Get a specific photo by ID (respects visibility) | Optional      |
| PUT    | `/photos/:id`              | Toggle like/unlike on a photo                   | Yes           |
| DELETE | `/photos/:id`              | Delete a photo (user must be owner)             | Yes           |
| PATCH  | `/photos/:id/visibility`   | Update photo visibility (public/private, body: `{ "isPublic": boolean }`) | Yes           |

### Chat
| Method | Endpoint                 | Description                                      | Auth Required |
|--------|--------------------------|--------------------------------------------------|---------------|
| POST   | `/chats`                 | Create a new chat with specified participants (body: `{ "participants": ["userId1", "userId2"] }`) | Yes           |
| GET    | `/chats`                 | Get all chats for the authenticated user         | Yes           |
| GET    | `/chats/:chatId/messages`| Get messages for a specific chat with pagination | Yes           |

## Socket.IO Events
Namespace: `/` (default)
Authentication: Via `socket.handshake.auth.token` (JWT Access Token) handled by `authSocket` middleware.

**Client to Server:**
-   `joinChat` (payload: `chatId`): User joins a specific chat room.
-   `leaveChat` (payload: `chatId`): User leaves a specific chat room.
-   `sendMessage` (payload: `{ chatId: string, text: string }`): User sends a message to a chat.
-   `typing` (payload: `{ chatId: string }`): User starts typing in a chat.
-   `stopTyping` (payload: `{ chatId: string }`): User stops typing in a chat.

**Server to Client:**
-   `message` (payload: `MessageObject`): Broadcasts a new message to users in the chat room. The `MessageObject` includes sender details.
-   `typing` (payload: `{ user: userId, name: userName }`): Broadcasts that a user is typing to others in the chat room.
-   `stopTyping` (payload: `{ user: userId, name: userName }`): Broadcasts that a user has stopped typing to others in the chat room.
-   `error` (payload: `{ message: string }`): Emitted to a specific client if an error occurs (e.g., authentication failure, error sending message).

## Project Structure
```
Photo-App-Backend/
├── src/
│   ├── config/         # Database (MongoDB), Cloudinary, CORS configuration
│   ├── controllers/    # Route handlers containing business logic for API requests
│   ├── middlewares/    # Express and Socket.IO middlewares (e.g., auth, error handling)
│   ├── models/         # Mongoose schemas for database collections
│   ├── providers/      # Utility providers (e.g., JwtProvider)
│   ├── routes/         # Express router definitions (v1, v2, etc.)
│   ├── services/       # (Currently contains exampleService) Intended for more complex business logic separation
│   ├── sockets/        # Socket.IO event handlers (e.g., chatSocket)
│   ├── utils/          # Helper functions, constants, algorithms
│   ├── validations/    # (Currently contains exampleValidation) Intended for request data validation logic
│   └── server.js       # Application entry point, Express server setup, Socket.IO initialization
├── .env                # Environment variables (ignored by Git)
├── .babelrc            # Babel configuration for transpiling JavaScript
├── .eslintrc.cjs       # ESLint configuration for code linting
├── .gitignore          # Specifies intentionally untracked files that Git should ignore
├── .dockerignore       # Specifies files and directories to ignore when building Docker image
├── Dockerfile          # Instructions to build the Docker image
├── package.json        # Project metadata, dependencies, and scripts
├── jsconfig.json       # JavaScript project configuration (e.g., path aliases)
└── README.md           # This file
```

## Contributing
Contributions are welcome! Please open issues or pull requests.

## License
MIT 2025 ngkhhuy