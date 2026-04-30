const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkAdmin, checkMember } = require('../middleware/roles');
const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validation');

// Get dashboard analytics for a project
router.get('/dashboard/:projectId', auth, checkMember, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
            return res.status(400).json({ msg: 'Invalid project ID format' });
        }
        const projectId = new mongoose.Types.ObjectId(req.params.projectId);
        const currentDate = new Date();

        const analytics = await Task.aggregate([
            { $match: { projectId: projectId } },
            {
                $facet: {
                    totalTasks: [
                        { $count: "count" }
                    ],
                    byStatus: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    byUser: [
                        { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "user"
                            }
                        },
                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                count: 1,
                                name: { $ifNull: ["$user.name", "Unassigned"] }
                            }
                        }
                    ],
                    overdueTasks: [
                        { 
                            $match: { 
                                dueDate: { $lt: currentDate }, 
                                status: { $ne: "done" } 
                            } 
                        },
                        {
                            $project: {
                                title: 1,
                                dueDate: 1,
                                priority: 1,
                                status: 1
                            }
                        }
                    ]
                }
            }
        ]);

        // Format the output
        const result = analytics[0];
        res.json({
            totalTasks: result.totalTasks[0]?.count || 0,
            byStatus: result.byStatus.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            byUser: result.byUser.map(item => ({
                name: item.name,
                count: item.count
            })),
            overdueTasks: result.overdueTasks
        });

    } catch (err) {
        next(err);
    }
});

// Get tasks for a project
router.get('/project/:projectId', auth, checkMember, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
            return res.status(400).json({ msg: 'Invalid project ID format' });
        }
        
        const tasks = await Task.find({ projectId: req.params.projectId })
                                .populate('assignedTo', 'name email')
                                .populate('createdBy', 'name email')
                                .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        next(err);
    }
});

// Create a task
router.post('/project/:projectId', auth, checkAdmin, [
    body('title', 'Task title is required').not().isEmpty(),
    body('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high']),
    body('status', 'Invalid status').optional().isIn(['todo', 'in progress', 'done'])
], validateRequest, async (req, res, next) => {
    try {

        const { title, description, dueDate, priority, status, assignedTo } = req.body;

        const newTask = new Task({
            title,
            description,
            dueDate: dueDate || undefined,
            priority,
            status,
            assignedTo: assignedTo || undefined,
            projectId: req.params.projectId,
            createdBy: req.user.id
        });

        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        next(err);
    }
});

// Update a task
router.put('/:id', auth, checkMember, [
    body('title', 'Task title cannot be empty').optional().not().isEmpty(),
    body('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high']),
    body('status', 'Invalid status').optional().isIn(['todo', 'in progress', 'done'])
], validateRequest, async (req, res, next) => {
    try {
        let task = req.task; // from checkMember middleware

        const { title, description, dueDate, priority, status, assignedTo } = req.body;

        task = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: { title, description, dueDate, priority, status, assignedTo } },
            { new: true }
        ).populate('assignedTo', 'name email').populate('createdBy', 'name email');

        res.json(task);
    } catch (err) {
        next(err);
    }
});

// Delete a task
router.delete('/:id', auth, checkAdmin, async (req, res, next) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Task removed' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
