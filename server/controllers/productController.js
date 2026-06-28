const Product = require('../models/Product'); // Keento qaabka alaabta

// @desc    Soo qaado dhammaan alaabta u diwaangashan isticmaalahan
const getProducts = async (req, res) => {
    const products = await Product.find({ user: req.user._id }); // Kaliya alaabta isaga iska leh
    res.json(products);
};

// @desc    Abuur alaab cusub (Create Product)
const createProduct = async (req, res) => {
    const { name, category, stock, price } = req.body;

    const product = new Product({
        name,
        category,
        stock,
        price,
        user: req.user._id // Ku xir qofka soo galiyey
    });

    const createdProduct = await product.save(); // Kaydi database-ka
    res.status(201).json(createdProduct);
};

// @desc    Wax ka bedel alaabta (Update Product)
const updateProduct = async (req, res) => {
    const { name, category, stock, price } = req.body;

    // Ka raadi alaabta ID-geeda iyo inuu isagu leeyahay
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (product) {
        // Bedel xogta alaabta
        product.name = name;
        product.category = category;
        product.stock = stock;
        product.price = price;

        const updatedProduct = await product.save(); // Kaydi isbedelka
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Tirtir alaabta (Delete Product)
const deleteProduct = async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (product) {
        await product.deleteOne(); // Tirtir alaabta
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
