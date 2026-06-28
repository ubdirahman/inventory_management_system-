const mongoose = require('mongoose'); // Library-ga MongoDB la hadla

const connectDB = async () => {
    try {
        // Isku day in aad ku xirto database-ka
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Haddii uu qalad dhaco, halkan ayuu ku tusayaa
        console.error(`Error: ${error.message}`);
        process.exit(1); // Jooji server-ka haddii database-ku diido
    }
};

module.exports = connectDB; // U gudbi server.js si loo kiciyo
