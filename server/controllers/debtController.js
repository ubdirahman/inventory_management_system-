const Debt = require('../models/Debt'); // Keento qaabka deynta
const Product = require('../models/Product'); // Keento qaabka alaabta

// @desc    Soo qaado dhammaan deynta (Debts)
const getDebts = async (req, res) => {
    const debts = await Debt.find({ user: req.user._id })
        .populate('customer', 'customer_name phone') // Soo qaado magaca macmiilka iyo taleefankiisa
        .populate('product', 'name'); // Soo qaado magaca alaabta
    res.json(debts);
};

// @desc    Abuur deyn cusub (Create Debt)
const createDebt = async (req, res) => {
    const { customer, product, quantity, price, status } = req.body;

    // Hubi in alaabtu jirto iyo in isticmaalahani leeyahay
    const productItem = await Product.findOne({ _id: product, user: req.user._id });
    if (!productItem) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Hubi haddii bakhaarku (Stock) ku filan yahay
    if (productItem.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Samee deynta
    const debt = new Debt({
        customer,
        product,
        quantity,
        price,
        status: status || 'unpaid',
        user: req.user._id
    });

    const createdDebt = await debt.save();

    // Ka jar alaabta bakhaarka (Update Stock)
    productItem.stock = productItem.stock - quantity;
    await productItem.save();

    res.status(201).json(createdDebt);
};

// @desc    Update-garee heerka deynta (Paid/Unpaid)
const updateDebtStatus = async (req, res) => {
    const { status } = req.body;
    const debt = await Debt.findOne({ _id: req.params.id, user: req.user._id });

    if (debt) {
        debt.status = status;
        const updatedDebt = await debt.save();
        res.json(updatedDebt);
    } else {
        res.status(404).json({ message: 'Debt not found' });
    }
};

// @desc    Tirtir deynta (Delete Debt)
const deleteDebt = async (req, res) => {
    const debt = await Debt.findOne({ _id: req.params.id, user: req.user._id });
    if (debt) {
        // Markii deynta la tirtiro, alaabta ku celi bakhaarka (Restore Stock)
        const product = await Product.findById(debt.product);
        if (product) {
            product.stock += debt.quantity;
            await product.save();
        }

        await debt.deleteOne();
        res.json({ message: 'Debt removed' });
    } else {
        res.status(404).json({ message: 'Debt not found' });
    }
};

// @desc    Wax ka bedel deynta (Update Debt details)
const updateDebt = async (req, res) => {
    const debt = await Debt.findOne({ _id: req.params.id, user: req.user._id });
    if (debt) {
        // Haddii tirada alaabta la bedelo, update-garee bakhaarka
        if (req.body.quantity && req.body.quantity !== debt.quantity) {
            const product = await Product.findOne({ _id: debt.product, user: req.user._id });
            if (product) {
                const diff = req.body.quantity - debt.quantity; // Kala geynta inta hore iyo inta cusub
                if (product.stock < diff) {
                    return res.status(400).json({ message: 'Insufficient stock for update' });
                }
                product.stock -= diff; // Bedel stock-ka
                await product.save();
                debt.quantity = req.body.quantity;
            }
        }

        debt.price = req.body.price || debt.price;
        debt.status = req.body.status || debt.status;

        // Haddii lacag qaar dhiman la bixiyo (Partial Payment)
        if (req.body.amount) {
            debt.paidAmount = (debt.paidAmount || 0) + Number(req.body.amount);
        }

        const updatedDebt = await debt.save();
        res.json(updatedDebt);
    } else {
        res.status(404).json({ message: 'Debt not found' });
    }
};

module.exports = { getDebts, createDebt, updateDebtStatus, deleteDebt, updateDebt };
