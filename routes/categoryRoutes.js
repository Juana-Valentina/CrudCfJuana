const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authJwt = require('../middlewares/authJwt');
const { canCreate, canEdit, canDelete, canView } = require('../middlewares/role');

// Ruta para crear categoría (Admin y Coordinador)
router.post('/', 
  authJwt.verifyToken, 
  canCreate, 
  categoryController.createCategory
);

// Ruta para obtener todas las categorías (todos los roles)
router.get('/', 
  authJwt.verifyToken, 
  canView, 
  categoryController.getCategories
);
 
// Ruta para obtener categoría por ID (todos los roles)
router.get('/:id', 
  authJwt.verifyToken, 
  canView, 
  categoryController.getCategoryById
);

// Ruta para actualizar categoría (Admin y Coordinador)
router.put('/:id', 
  authJwt.verifyToken, 
  canEdit, 
  categoryController.updateCategory
);

// Ruta para eliminar categoría (Solo Admin)
router.delete('/:id', 
  authJwt.verifyToken, 
  canDelete, 
  categoryController.deleteCategory
);

module.exports = router;