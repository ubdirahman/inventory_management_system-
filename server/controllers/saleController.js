const Sale = require('../models/Sale'); // Keento qaabka iibka
const Product = require('../models/Product'); // Keento qaabka alaabta

// @desc    Soo qaado dhamaan iibka uu sameeyey isticmaalahan
const getSales = async (req, res) => {
    const sales = await Sale.find({ user: req.user._id }).populate('product', 'name price');
    res.json(sales);
};

// @desc    Samee iib cusub (Create Sale)
const createSale = async (req, res) => {
    const { product, quantity, price } = req.body;

    // Hubi alaabta iyo inuu isticmaalahan leeyahay
    const productItem = await Product.findOne({ _id: product, user: req.user._id });
    if (!productItem) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Hubi in stock-ku ku filan yahay
    if (productItem.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Xisaabi wadarta guud
    const total = quantity * price;

    // Samee diwaanka iibka
    const sale = new Sale({
        product,
        quantity,
        price,
        total,
        user: req.user._id
    });

    const createdSale = await sale.save();

    // Ka jar alaabta la iibiyey stock-ka (Update Stock)
    productItem.stock = productItem.stock - quantity;
    await productItem.save();

    res.status(201).json(createdSale);
};

// @desc    Tirtir iib (Delete Sale)
const deleteSale = async (req, res) => {
    const sale = await Sale.findOne({ _id: req.params.id, user: req.user._id });

    if (sale) {
        // Markii iibka la tirtiro, alaabta ku celi bakhaarka (Restore Stock)
        const product = await Product.findById(sale.product);
        if (product) {
            product.stock += sale.quantity;
            await product.save();
        }

        await sale.deleteOne();
        res.json({ message: 'Sale removed' });
    } else {
        res.status(404).json({ message: 'Sale not found' });
    }
};

// @desc    Wax ka bedel iibka (Update Sale)
const updateSale = async (req, res) => {
    const sale = await Sale.findOne({ _id: req.params.id, user: req.user._id });

    if (sale) {
        // Halkan waxaan kaliya u oggolaanayaa in qiimaha la bedelo
        // Haddii tirada/alaabta la dhaafo waa in la tirtiraa kadibna cusub la sameeyaa
        sale.price = req.body.price || sale.price;
        sale.total = sale.quantity * sale.price;

        const updatedSale = await sale.save();
        res.json(updatedSale);
    } else {
        res.status(404).json({ message: 'Sale not found' });
    }
};

module.exports = { getSales, createSale, deleteSale, updateSale };
