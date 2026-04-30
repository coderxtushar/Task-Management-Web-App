const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return first error message for simplicity with toast notifications
        return res.status(400).json({ msg: errors.array()[0].msg });
    }
    next();
};

module.exports = validateRequest;
