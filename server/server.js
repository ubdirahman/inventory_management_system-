const express = require('express'); // Soo dhowow Express framework-ka
const dotenv = require('dotenv'); // Ku shaqaynta faylka .env (Settings-ka qarsoodiga ah)
const cors = require('cors'); // U oggolaanshaha in frontend-ka kale la hadlo server-ka
const connectDB = require('./config/db'); // Soo kicinta xiriirka Database-ka

// Akhri database-ka iyo configuration-ka kale
dotenv.config();

const app = express(); // Samaynta Application-ka Express

// Ku xir database-ka MongoDB (waa in la sugto)
const startServer = async () => {
    try {
        await connectDB();

        // Port-ka uu server-ku ku shaqaynayo
        const PORT = process.env.PORT || 5000;

        // Bilaabidda server-ka
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
};


// Middleware: Waxyaabaha codsiyada soo dhex mara
app.use(cors()); // Oggolaanshaha xiriirka dibadda
app.use(express.json()); // U oggolaanshaha in server-ku akhriyo JSON data

// Bilaabidda server-ka (ka dib DB connection)
startServer();


// Waddada ugu horraysa (Home Route)
app.get('/', (req, res) => {
    res.send('API is running...'); // Markaad gashid server-ka http://localhost:5000/
});

// Qaybaha API-yada (Routes Setup)
app.use('/api/auth', require('./routes/authRoutes')); // Qaybta aqoonsiga (Login/Register)
app.use('/api/admin', require('./routes/adminRoutes')); // Qaybta maamulka
app.use('/api/products', require('./routes/productRoutes')); // Qaybta alaabta (Products)
app.use('/api/customers', require('./routes/customerRoutes')); // Qaybta macaamiisha
app.use('/api/sales', require('./routes/saleRoutes')); // Qaybta iibka
app.use('/api/debts', require('./routes/debtRoutes')); // Qaybta deynta
app.use('/api/dashboard', require('./routes/dashboardRoutes')); // Qaybta warbixinta (Dashboard)
app.use('/api/payments', require('./routes/paymentRoutes')); // Qaybta lacag bixinta (WaafiPay)


