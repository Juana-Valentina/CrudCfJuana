const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const authJwt = require('../middlewares/authJwt');
const { canCreate, canEdit, canDelete, canView } = require('../middlewares/role');
const { check } = require('express-validator');
 
// Validaciones
const validateSubcategory = [
    check('name')
        .not().isEmpty().withMessage('❌ El nombre es obligatorio')
        .trim()
        .escape(),
    check('description')
        .not().isEmpty().withMessage('❌ La descripción es obligatoria')
        .trim()
        .escape(),
    check('category')
        .not().isEmpty().withMessage('❌ La categoría es obligatoria')
        .isMongoId().withMessage('❌ ID de categoría inválido')
];

// Ruta para crear subcategoría (Admin y Coordinador)
router.post('/', 
    authJwt.verifyToken,    // Verifica token JWT
    canCreate,              // Verifica permisos de creación
    validateSubcategory,    // Validación de campos
    subcategoryController.createSubcategory
);

// Ruta para obtener todas las subcategorías (todos los roles)
router.get('/', 
    authJwt.verifyToken,    // Verifica token JWT
    canView,                // Verifica permisos de visualización
    subcategoryController.getSubcategories
);

// Ruta para obtener subcategoría por ID (todos los roles)
router.get('/:id', 
    authJwt.verifyToken,    // Verifica token JWT
    canView,                // Verifica permisos de visualización
    subcategoryController.getSubcategoryById
);

// Ruta para actualizar subcategoría (Admin y Coordinador)
router.put('/:id', 
    authJwt.verifyToken,    // Verifica token JWT
    canEdit,                // Verifica permisos de edición
    validateSubcategory,    // Validación de campos
    subcategoryController.updateSubcategory
);

// Ruta para eliminar subcategoría (Solo Admin)
router.delete('/:id', 
    authJwt.verifyToken,    // Verifica token JWT
    canDelete,              // Verifica permisos de eliminación
    subcategoryController.deleteSubcategory
);

module.exports = router;