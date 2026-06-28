const Product = require('../models/Product'); // Keento qaabka alaabta
const Customer = require('../models/Customer'); // Keento qaabka macmiilka
const Sale = require('../models/Sale'); // Keento qaabka iibka
const Debt = require('../models/Debt'); // Keento qaabka deynta

// @desc    Soo qaado stats-ka dashboard-ka ee isticmaalaha hadda galay
const getUserDashboardStats = async (req, res) => {
    try {
        // Isku darka alaabta uu leeyahay isticmaalahan
        const totalProducts = await Product.countDocuments({ user: req.user._id });

        // Isku darka dhamaan iibka uu sameeyey isticmaalahan
        const sales = await Sale.find({ user: req.user._id });
        const totalSalesCount = sales.length;
        const totalSalesAmount = sales.reduce((acc, sale) => acc + sale.total, 0);

        // Chart Data: Iibka maalin kasta (Sales by Date)
        const salesByDate = await Sale.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } } // Ku habay siday u kala horeeyaan taariikh ahaan
        ]);

        const formattedSalesByDate = salesByDate.map(item => ({
            date: item._id,
            total: item.total
        }));

        // Macmiil kasta oo isaga u diwaangashan
        const totalCustomers = await Customer.countDocuments({ user: req.user._id });

        // Deynta guud
        const debts = await Debt.find({ user: req.user._id });
        const totalDebtCount = debts.length;

        // Xisaabinta deynta (Inta dhiman, Inta la bixiyey iyo Inta guud)
        const totalDebtInitial = debts.reduce((acc, d) => acc + (d.price * d.quantity), 0);
        const totalPaidFromDebts = debts.reduce((acc, d) => acc + (d.paidAmount || 0), 0);
        const totalPendingDebt = totalDebtInitial - totalPaidFromDebts;

        // Wadarta lacagta qasnada gashay (Iibka kaashka ah + Lacagta deynta laga bixiyey)
        const totalSystemPaid = totalSalesAmount + totalPaidFromDebts;

        // Chart Data: Alaabta iyo noocyadeeda (Products by Category)
        const productsByCategory = await Product.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedProductsByCategory = productsByCategory.map(item => ({
            name: item._id,
            value: item.count
        }));

        // Server-ka oo u jawaabaya Frontend-ka
        res.json({
            totalProducts,
            totalSalesCount,
            totalSalesAmount,
            totalCustomers,
            totalDebtCount,
            totalDebtAmount: totalPendingDebt, // Lacagta deynta ah ee maqan
            totalPaidAmount: totalSystemPaid, // Lacagta gacanta ku jirta
            totalPendingDebt: totalPendingDebt,
            salesByDate: formattedSalesByDate,
            productsByCategory: formattedProductsByCategory
        });
    } catch (error) {
        // Haddii qalad dhaco
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserDashboardStats };
