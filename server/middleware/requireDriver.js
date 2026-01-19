const requireDriver = (req, res, next) => {
    if(!req.user || req.user.role!=='driver'){
        return res.status(403).json({success: false,message: 'Access denied. Driver role required.'});
    }
    next();
}

module.exports = requireDriver;