const Task = require('../models/Task');

const checkAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access Denied: Admin role required' });
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error in checkAdmin middleware');
    }
};

const checkMember = async (req, res, next) => {
    try {
        if (req.user.role === 'admin') {
            req.isAdmin = true;
            return next();
        }

        req.isAdmin = false;
        
        // Members: only assigned tasks
        if (req.params.id) {
            const task = await Task.findById(req.params.id);
            if (!task) return res.status(404).json({ msg: 'Task not found' });
            
            if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
                return res.status(403).json({ msg: 'Access Denied: Members can only modify their assigned tasks' });
            }
            req.task = task;
        }

        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error in checkMember middleware');
    }
};

module.exports = { checkAdmin, checkMember };
