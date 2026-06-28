const Joi = require('joi'); // Library-ga u xilsaaran xaqiijinta xogta (Validation)

// Qaabka loo hubiyo macluumaadka Macmiilka (Customer)
const customerSchema = Joi.object({
  customer_name: Joi.string().required(), // Magaca waa qasab
  phone: Joi.string().required(), // Taleefanka waa qasab
  address: Joi.string().allow('', null) // Address-ka waa laga tagi karaa
});

// Qaabka loo hubiyo macluumaadka Alaabta (Product)
const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(), // Qiimaha ma noqon karo wax ka yar 0
  category: Joi.string().required(),
  stock: Joi.number().integer().min(0).required() // Tirada alaabta bakhaarka ku jirta
});

// Qaabka loo hubiyo macluumaadka Iibka (Sale)
const saleSchema = Joi.object({
  product: Joi.string().required(),
  customer: Joi.string().allow('', null),
  quantity: Joi.number().integer().min(1).required(), // Ugu yaraan waa in hal la iibsado
  price: Joi.number().min(0).required(),
  paymentMode: Joi.string().valid('cash', 'waafi').default('cash')
});

// Qaabka loo hubiyo macluumaadka Deynta (Debt)
const debtSchema = Joi.object({
  customer: Joi.string().required(),
  product: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required(),
  status: Joi.string().valid('pending', 'paid', 'unpaid').default('unpaid'), // Heerka deynta
  paymentMode: Joi.string().valid('cash', 'waafi').default('cash')
});

// Qaabka loo hubiyo Is-diwaangelinta (Register)
const registerSchema = Joi.object({
  full_name: Joi.string().required(),
  phone: Joi.string().required(),
  username: Joi.string().min(3).required(), // Username-ka waa inuu 3 xaraf ka korreeyaa
  password: Joi.string().min(6).required(), // Password-ka waa inuu 6 xaraf ka korreeyaa
  role: Joi.string().valid('user', 'admin').default('user')
});

// Qaabka loo hubiyo Soo-galka (Login)
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// Shaqada (Function) fulinaysa hubinta (Middleware)
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body); // Xaqiiji xogta req.body ku jirta
    if (error) {
      // Haddii xogtu khaldan tahay, u sheeg isticmaalaha
      return res.status(400).json({ message: error.details[0].message });
    }
    next(); // Haddii ay sax tahay, u gudbi shaqada xigta
  };
};

module.exports = {
  validate,
  customerSchema,
  productSchema,
  saleSchema,
  debtSchema,
  registerSchema,
  loginSchema,
  // Qaabka hubinta marka deynta la wax laga bedelayo (Update)
  debtUpdateSchema: Joi.object({
    customer: Joi.string(),
    product: Joi.string(),
    quantity: Joi.number().integer().min(1),
    price: Joi.number().min(0),
    status: Joi.string().valid('pending', 'paid', 'unpaid'),
    amount: Joi.number().min(0),
    paymentMode: Joi.string().valid('cash', 'waafi')
  })
};
