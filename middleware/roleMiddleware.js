const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Access forbidden: You do not have the required permissions for this action.' 
            });
        }
        next();
    };
};

module.exports = authorizeRoles;