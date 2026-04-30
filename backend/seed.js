const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        console.log('Cleared existing data.');

        // Create Users
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const memberPassword = await bcrypt.hash('password123', salt);

        const adminUser = await User.create({
            name: 'Super Admin',
            email: 'admin@taskmanager.com',
            password: adminPassword,
            role: 'admin'
        });

        const memberUser1 = await User.create({
            name: 'John Member',
            email: 'john@taskmanager.com',
            password: memberPassword,
            role: 'user'
        });

        const memberUser2 = await User.create({
            name: 'Sarah Member',
            email: 'sarah@taskmanager.com',
            password: memberPassword,
            role: 'user'
        });

        console.log('Created 1 Admin and 2 Member accounts.');

        // Create a Sample Project
        const sampleProject = await Project.create({
            name: 'Website Redesign Phase 1',
            admin: adminUser._id,
            members: [memberUser1._id, memberUser2._id]
        });

        console.log('Created Sample Project.');

        // Create Sample Tasks
        await Task.create([
            {
                title: 'Design UI Mockups',
                description: 'Create initial Figma designs for the new landing page.',
                status: 'todo',
                priority: 'high',
                projectId: sampleProject._id,
                assignedTo: memberUser1._id,
                createdBy: adminUser._id,
                dueDate: new Date(Date.now() + 86400000 * 3) // 3 days from now
            },
            {
                title: 'Develop Backend API',
                description: 'Set up Express routes and MongoDB models.',
                status: 'in progress',
                priority: 'high',
                projectId: sampleProject._id,
                assignedTo: memberUser2._id,
                createdBy: adminUser._id,
                dueDate: new Date(Date.now() + 86400000 * 5)
            },
            {
                title: 'Write Documentation',
                description: 'Document the new API endpoints in Swagger.',
                status: 'todo',
                priority: 'low',
                projectId: sampleProject._id,
                assignedTo: null, // Unassigned
                createdBy: adminUser._id,
                dueDate: new Date(Date.now() + 86400000 * 7)
            }
        ]);

        console.log('Created 3 Sample Tasks.');
        console.log('\n--- SEED COMPLETE ---');
        console.log('Admin Login: admin@taskmanager.com / admin123');
        console.log('Member Login: john@taskmanager.com / password123');
        console.log('---------------------\n');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
