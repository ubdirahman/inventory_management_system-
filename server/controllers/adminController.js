const User = require('../models/User'); // Keento qaabka isticmaalaha
const bcrypt = require('bcryptjs'); // Library-ga password-ka qariya

// @desc    Soo qaado xogta guud ee Dashboard-ka maamulka (Stats)
const getAdminStats = async (req, res) => {
    const totalUsers = await User.countDocuments(); // Isku darka dhammaan isticmaalaha

    // Soo qaado isticmaalaha maanta is-diwaangeliyey
    const newUsersToday = await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
        totalUsers,
        newUsersToday
    });
};

// @desc    Soo qaado dhammaan isticmaalaha (Users)
const getUsers = async (req, res) => {
    const users = await User.find({}).select('-password'); // Soo qaado dhammaan, iska daa password-ka
    res.json(users);
};

// @desc    Tirtir isticmaale (User)
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id); // Ka raadi ID-ga la soo diray

    if (user) {
        await user.deleteOne(); // Haddii la helay, tirtir
        res.json({ message: 'User removed' });
    } else {
        // Haddii aan la helin
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Maamuluhu inuu diwaangeliyo isticmaale cusub (Register by Admin)
const registerUserByAdmin = async (req, res) => {
    try {
        const { full_name, username, phone, password, role } = req.body;

        // Hubi in username-ku hore u jiray
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Aminta password-ka (Hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Abuur isticmaalaha cusub
        const user = await User.create({
            full_name,
            username,
            phone,
            password: hashedPassword,
            role: role || 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                full_name: user.full_name,
                username: user.username,
                phone: user.phone,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        // Haddii uu qalad dhaco xilliga diwaangalinta
        console.error('Register User Error:', error);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
};

// @desc    Xir ama fur isticmaalaha (Block/Unblock)
const toggleUserBlock = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Bedel isBlocked (haddii uu true ahaa ka dhig false, iyo lidkeeda)
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            isBlocked: user.isBlocked
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    U bedel password-ka isticmaalaha (Password Update)
const updateUserPassword = async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
        // Qari password-ka cusub
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    getAdminStats,
    getUsers,
    deleteUser,
    toggleUserBlock,
    updateUserPassword,
    registerUserByAdmin
};
