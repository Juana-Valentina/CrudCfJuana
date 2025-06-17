const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');
const authJwt = require('../middlewares/authJwt');
const { canCreate, canEdit, canDelete, canView } = require('../middlewares/role');
const { check } = require('express-validator');

// Validaciones para productos
const validateProduct = [
    check('name')
        .not().isEmpty().withMessage('❌ El nombre es obligatorio')
        .trim()
        .escape(),
    check('description')
        .not().isEmpty().withMessage('❌ La descripción es obligatoria')
        .trim()
        .escape(),
    check('price')
        .isFloat({ min: 0 }).withMessage('❌ El precio debe ser mayor a 0')
        .toFloat(),
    check('stock')
        .isInt({ min: 0 }).withMessage('❌ El stock no puede ser negativo')
        .toInt(),
    check('category')
        .not().isEmpty().withMessage('❌ La categoría es obligatoria')
        .isMongoId().withMessage('❌ ID de categoría inválido'),
    check('subcategory')
        .not().isEmpty().withMessage('❌ La subcategoría es obligatoria')
        .isMongoId().withMessage('❌ ID de subcategoría inválido')
];

// Ruta para crear producto (Admin y Coordinador)
router.post('/', 
    authJwt.verifyToken,    // Verifica token JWT
    canCreate,              // Verifica permisos de creación
    validateProduct,        // Validación de campos
    productController.createProduct
);

// Ruta para obtener todos los productos (todos los roles)
router.get('/', 
    authJwt.verifyToken,    // Verifica token JWT
    canView,                // Verifica permisos de visualización
    productController.getProducts
);

// Ruta para obtener producto por ID (todos los roles)
router.get('/:id', 
    authJwt.verifyToken,    // Verifica token JWT
    canView,                // Verifica permisos de visualización
    productController.getProductById
);

// Ruta para actualizar producto (Admin y Coordinador)
router.put('/:id', 
    authJwt.verifyToken,    // Verifica token JWT
    canEdit,                // Verifica permisos de edición
    validateProduct,        // Validación de campos
    productController.updateProduct
);

// Ruta para eliminar producto (Solo Admin)
router.delete('/:id', 
    authJwt.verifyToken,    // Verifica token JWT
    canDelete,              // Verifica permisos de eliminación
    productController.deleteProduct
);

module.exports = router;