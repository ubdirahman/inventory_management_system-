const Customer = require('../models/Customer'); // Keento qaabka macmiilka

// @desc    Soo qaado dhammaan macaamiisha uu leeyahay isticmaalahan yar
const getCustomers = async (req, res) => {
    const customers = await Customer.find({ user: req.user._id }); // Kaliya macaamiisha isaga u diwaangashan
    res.json(customers);
};

// @desc    Abuur macmiil cusub
const createCustomer = async (req, res) => {
    const { customer_name, phone, address } = req.body;

    // Samaysashada macmiilka cusub
    const customer = new Customer({
        customer_name,
        phone,
        address,
        user: req.user._id // Ku xir isticmaalaha hadda galay nidaamka (Log-in)
    });

    const createdCustomer = await customer.save(); // Kaydi database-ka
    res.status(201).json(createdCustomer);
};

// @desc    Wax ka bedel macmiil jira (Update)
const updateCustomer = async (req, res) => {
    const { customer_name, phone, address } = req.body;

    // Ka raadi macmiilka ID-giisa iyo inuu isagu leeyahay
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });

    if (customer) {
        // Bedel xogta
        customer.customer_name = customer_name;
        customer.phone = phone;
        customer.address = address;

        const updatedCustomer = await customer.save(); // Kaydi isbedelka
        res.json(updatedCustomer);
    } else {
        res.status(404).json({ message: 'Customer not found' });
    }
};

// @desc    Tirtir macmiil
const deleteCustomer = async (req, res) => {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });

    if (customer) {
        await customer.deleteOne(); // Tirtir macmiilka
        res.json({ message: 'Customer removed' });
    } else {
        res.status(404).json({ message: 'Customer not found' });
    }
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };
