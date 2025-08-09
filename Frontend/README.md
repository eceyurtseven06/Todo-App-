# Todo App 

This is the frontend for the Todo Application , built with Vue3 and TypeScript.
It includes:
- **Login Page**
- **Register Page**
- **Todo List Page**

It communicates with the backend API via Axios and uses JWT authentication.

---

## Technologies Used 
- **Vue3:** Modern JavaScript framework for UI
- **TypeScript:** Strongly typed JavaScript
- **Axios:** HTTP requests to the backend
- **Vue Router:** Client-side navigation
- **CSS:** Custom styling, responsive design
- **LocalStorage:** Store JWT token for authentication

---

## Setup Instructions

### Prerequisites
Make sure you have :
1. Node.js (latest version) 
Anything you want to ask you can read [https://code.visualstudio.com/docs/nodejs/nodejs-tutorial] .
2. npm (comes with Node.js) 
3. Backend API running locally(in backend you have to press 'Run and Debug')

### Install Dependencies
```
npm install
```

### Configure API URL
In your frontend project, update the backend URL in API calls if needed (e.g., in login, register, and todo components)
```
const API_URL = 'http://localhost:5000
```

### Run the App
Before the running the app make sure you are in the right file 
If you are not in the right file you have to write:

```
cd todo-app
```

then write 

```
npm run dev
```

When you run the app frontend will be started at: [http://localhost:5173/] (http://localhost:5173/)


## Pages Overview

### Register Page 
- Allows new users to sign up.
- Sends POST /api/auth/register request.
- Redirects to Login page after successful registration.

### Login Page 
- Allows existing users to log in using username and password.
- Sends POST /api/auth/login request.
- Saves JWT token to localStorage.
- Redirects to Todo List page on success.

### Todo Page 
- Displays all todos from GET /api/todo.
- Allows creating, editing, marking as complete, and deleting todos.
- Requires a valid JWT token in request headers.

## Authentication Notes
- All todo operations require authentication.
- Token is automatically included in Axios requests after login.









