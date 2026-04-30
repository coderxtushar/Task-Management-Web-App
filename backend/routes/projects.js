const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkAdmin } = require('../middleware/roles');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validation');

// Create a project
router.post('/', auth, [
    body('name', 'Project name is required').not().isEmpty()
], validateRequest, async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ msg: 'Project name is required' });

        const newProject = new Project({
            name,
            admin: req.user.id,
            members: [] // admin is implicitly a member with full rights, but doesn't need to be in the members array unless explicitly desired.
        });

        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        next(err);
    }
});

// Get user's projects
router.get('/', auth, async (req, res, next) => {
    try {
        // Find projects where user is admin OR in members array
        const projects = await Project.find({
            $or: [
                { admin: req.user.id },
                { members: req.user.id }
            ]
        }).populate('admin', 'name email').populate('members', 'name email');

        res.json(projects);
    } catch (err) {
        next(err);
    }
});

// Add member to project
router.post('/:projectId/members', auth, checkAdmin, [
    body('email', 'Please include a valid email').isEmail()
], validateRequest, async (req, res, next) => {
    try {
        const { email } = req.body;
        
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ msg: 'User with this email not found' });
        }

        if (project.admin.toString() === userToAdd.id || project.members.includes(userToAdd.id)) {
            return res.status(400).json({ msg: 'User is already a member or admin of this project' });
        }

        project.members.push(userToAdd.id);
        await project.save();

        const updatedProject = await Project.findById(project.id).populate('admin', 'name email').populate('members', 'name email');
        res.json(updatedProject);
    } catch (err) {
        next(err);
    }
});

// Remove member from project
router.delete('/:projectId/members/:userId', auth, checkAdmin, async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        
        const userToRemoveId = req.params.userId;

        if (!project.members.includes(userToRemoveId)) {
            return res.status(404).json({ msg: 'User is not a member of this project' });
        }

        project.members = project.members.filter(memberId => memberId.toString() !== userToRemoveId);
        await project.save();

        const updatedProject = await Project.findById(project.id).populate('admin', 'name email').populate('members', 'name email');
        res.json(updatedProject);
    } catch (err) {
        next(err);
    }
});

// Delete project
router.delete('/:projectId', auth, checkAdmin, async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        await Project.findByIdAndDelete(req.params.projectId);
        await Task.deleteMany({ projectId: req.params.projectId });

        res.json({ msg: 'Project and all associated tasks deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
