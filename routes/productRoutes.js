const express = require('express');
const router = express.Router();
const  productControllers = require('../controllers/productControllers');
const { check} = require('express-validator');

const validateproduct = [
    check('name').not().isEmpty().withMessage('El nommbre es obligatorio'),
    check('description').not().isEmpty().withMessage('La descripcion es obligatoria'),
    check('price').isFloat({min:0}).withMessage('Precio invalido'),
    check('stock').isInt({min:0}).withMessage('stock invalido'),
    check('category').not().isEmpty().withMessage('La categoria es obligatoria'),
    check('subcategory').not().isEmpty().withMessage('La subcategoria es requerida')
];

router.post('/', validateproduct, productControllers.createProduct);
router.get('/', productControllers.getProducts);
router.get('/:id', productControllers.getProductById);
router.put('/:id', validateproduct, productControllers.updateProduct);
router.delete('/:id', productControllers.deleteProduct);

module.exports = router;