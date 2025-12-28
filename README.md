# Social Media App

A full-stack social media application designed to connect friends. Users can register, login, post updates with images, like posts, comment, and follow/unfollow other users.

## 🚀 Features

*   **User Authentication**: Secure Registration and Login using JWT.
*   **Media Sharing**: Create posts with text captions and images.
*   **Social Interaction**: Like and comment on posts.
*   **Networking**: Follow and unfollow other users to see their updates in your feed.
*   **Profile Management**: View user profiles, including their posts, followers, and following lists. Update your own profile picture.
*   **Responsive Design**: A clean, modern UI optimized for various devices.

## 🛠️ Technology Stack

### Backend
*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web framework for building the API.
*   **MongoDB**: NoSQL database for storing user and post data.
*   **Mongoose**: ODM library for MongoDB.
*   **JWT (JSON Web Token)**: For secure user authentication.
*   **Multer**: Middleware for handling file uploads (images).
*   **Bcrypt.js**: For hashing passwords.
*   **Cors**: To handle Cross-Origin Resource Sharing.
*   **Dotenv**: For environment variable management.

### Frontend
*   **HTML5**: Structure of the web pages.
*   **CSS3**: Styling and responsive layout.
*   **Vanilla JavaScript**: Dynamic behavior and API integration.

## 📂 Project Structure

```
├── Backend/
│   ├── config/             # Database configuration
│   ├── controllers/        # Logic for handling requests
│   ├── middleware/         # Auth and upload middleware
│   ├── models/             # Mongoose schemas (User, Post, Comment)
│   ├── routes/             # API routes definition
│   ├── uploads/            # Directory for uploaded images
│   ├── .env                # Environment variables
│   ├── server.js           # Entry point for the backend server
│   └── package.json        # Backend dependencies
│
├── Frontend/
│   ├── images/             # Static assets for the frontend
│   ├── App.js              # Main frontend logic (API calls, UI updates)
│   ├── style.css           # Global styles
│   ├── index.html          # Landing page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── feed.html           # Main feed page
│   └── profile.html        # User profile page
│
└── README.md               # Project documentation
```

## 🔧 Installation & Setup

### Prerequisites
*   Identify that you have [Node.js](https://nodejs.org/) installed.
*   Ensure [MongoDB](https://www.mongodb.com/try/download/community) is installed and running locally.

### Steps

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **Backend Setup**
    Navigate to the `Backend` directory and install dependencies:
    ```bash
    cd Backend
    npm install
    ```

    Create a `.env` file in the `Backend` directory with the following variables:
    ```env
    MONGO_URI=mongodb://127.0.0.1:27017/db
    PORT=3000
    JWT_SECRET=your_jwt_secret_key
    ```
    *(Note: You can use the provided `.env` file as a reference.)*

    Start the backend server:
    ```bash
    npm start
    ```
    The server should run on `http://localhost:3000`.

3.  **Frontend Setup**
    The frontend is built with vanilla HTML/JS, so you can serve it using any static file server.
    
    *   **Option A (VS Code Live Server)**: Open `Frontend/index.html` with the "Live Server" extension.
    *   **Option B (Direct Open)**: You can simply double-click `Frontend/index.html` to open it in your browser (though some features might require a local server environment for proper path resolution).

## 📡 API Endpoints

### Auth
*   `POST /api/auth/register` - Register a new user
*   `POST /api/auth/login` - Login user

### Posts
*   `GET /api/posts` - Get all posts (Feed)
*   `POST /api/posts` - Create a new post (requires auth & image)
*   `POST /api/posts/like/:id` - Like/Unlike a post

### Users
*   `GET /api/users/profile/:id` - Get user profile
*   `PUT /api/users/profile` - Update profile picture
*   `POST /api/users/follow/:id` - Follow a user
*   `POST /api/users/unfollow/:id` - Unfollow a user

### Comments
*   `GET /api/comments/:postId` - Get comments for a post
*   `POST /api/comments/:postId` - Add a comment to a post
