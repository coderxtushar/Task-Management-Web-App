# Team Task Manager (Ethara AI)

## Overview
A real-world collaborative Team Task Management Web Application designed to streamline team collaboration, project tracking, and task delegation. Users can create and join projects, assign tasks, and track progress through a simplified, intuitive interface inspired by tools like Trello and Asana.

## Features

**1. User Authentication**
- Signup with Name, Email, and Password.
- Secure login utilizing JWT (JSON Web Tokens) for stateless authentication.

**2. Project Management**
- Users can create isolated projects (the creator automatically becomes the Admin of that project).
- Admins can securely add and remove members via email.
- Members can view and access the projects they are assigned to.

**3. Task Management**
- Create tasks with a Title, Description, Due Date, and Priority (Low, Medium, High).
- Assign tasks to specific users within the project.
- Interactive Kanban Board to drag-and-drop tasks and seamlessly update statuses (To Do, In Progress, Done).

**4. Dashboard Analytics**
- Real-time overview of total tasks within a project.
- Visual breakdown of tasks by status.
- Workload distribution showing tasks assigned per user.
- Dedicated section highlighting overdue tasks.

**5. Role-Based Access Control**
- **Admin**: Has full authority to manage tasks and invite/remove users from the project.
- **Member**: Can only view the project board and update the status of tasks specifically assigned to them.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router, `@hello-pangea/dnd` (Drag & Drop), Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Security**: JWT Authentication, Bcrypt.js password hashing

## Environment Variables
Before running the application locally or deploying, configure your environment variables. Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/TaskManagementEtharaAi
JWT_SECRET=your_super_secret_jwt_key
```

## Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd team-task-manager
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   # (Optional) Seed the database with default accounts and a sample project
   node seed.js 
   npm start
   ```

3. **Setup the Frontend**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Test Credentials
If you would like to test the live application without registering a new account, you can use the following pre-seeded test accounts:

**Admin Account:**
- **Email**: `admin@taskmanager.com`
- **Password**: `admin123`

**Member Account:**
- **Email**: `john@taskmanager.com`
- **Password**: `password123`

## Deployment (Railway)
This full-stack application is deployed and publicly accessible via Railway. Both the frontend and backend are successfully connected.

### Deployment Steps
1. **Database**: A MongoDB Atlas cluster was created to host the NoSQL database.
2. **Backend**: Connected the GitHub repository to a Railway Web Service. The root directory was set to `/backend`. The environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`) were securely injected into the Railway dashboard.
3. **Frontend**: Connected the GitHub repository to a second Railway Web Service. The root directory was set to `/frontend`. The API base URL was updated to point to the live Railway backend URL. The build command was configured as `npm run build` and the output directory as `dist/`.

