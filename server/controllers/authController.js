const User = require('../models/User'); // Keento qaabka isticmaalaha (Model)
const jwt = require('jsonwebtoken'); // Keento Token-ka amniga
const bcrypt = require('bcryptjs'); // Keento qashinka (Hashing) password-ka

// Shaqo (Function) soo saarta Token-ka isticmaalaha si uu u galo nidaamka
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Laga soo galo (Login)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { username, password } = req.body; // Soo qaado username iyo password-ka la soo qoray

    // Ka raadi isticmaalaha database-ka
    const user = await User.findOne({ username });

    // Hubi haddii uu jiro iyo haddii password-ku sax yahay
    if (user && (await bcrypt.compare(password, user.password))) {
        // Haddii uu blocked yahay, ha u oggolaan
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account is blocked. Please contact admin.' });
        }
        // Haddii wax walba sax yihiin, sii Token-ka iyo macluumaadka
        res.json({
            _id: user._id,
            full_name: user.full_name,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        // Haddii uu qalad yahay login-ku
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

// @desc    Is diwaangelinta (Register)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { full_name, phone, username, password, role } = req.body;

    // Hubi in isticmaalaha hore u jiray
    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Aminta password-ka (Hashing) ka hor intaan la kaydin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Abuur (Create) isticmaale cusub
    const user = await User.create({
        full_name,
        phone,
        username,
        password: hashedPassword,
        role: role || 'user',
    });

    if (user) {
        // Haddii si fiican loo abuuray
        res.status(201).json({
            _id: user._id,
            full_name: user.full_name,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        // Haddii xogta la soo diray ay qaldan tahay
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = { loginUser, registerUser };
