const jwt = require('jsonwebtoken'); // Library-ga Token-ka hubiya
const User = require('../models/User'); // Keento qaabka isticmaalaha

// Middleware hubiya in isticmaalahu leeyahay Token sax ah (Ammaanka)
const protect = async (req, res, next) => {
    let token;

    // Hubi haddii Header-ka uu ku jiro Token-ka (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ka soo saar Token-ka dhabta ah Header-ka
            token = req.headers.authorization.split(' ')[1];

            // Hubi haddii Token-ku sax yahay (Verify)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Soo qaado macluumaadka isticmaalaha (iska daa password-ka)
            req.user = await User.findById(decoded.id).select('-password');

            // Hubi haddii isticmaalaha laga xiray nidaamka (Blocked)
            if (req.user && req.user.isBlocked) {
                return res.status(403).json({ message: 'User is blocked' });
            }

            next(); // U gudbi shaqada xigta (Route-ka)
        } catch (error) {
            // Haddii Token-ku dhacay ama uu qaldan yahay
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // Haddii aan la soo dirin wax Token ah
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware hubiya in isticmaalahu yahay Maamule (Admin)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Waa maamule, ha dhex maro
    } else {
        // Ma ahan maamule, u diid
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
