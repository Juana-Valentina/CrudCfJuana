// controllers/categoryController.js
const Category = require('../models/Category');
const { canCreate, canEdit, canDelete, canView } = require('../middlewares/role');

// Crear categoría (Admin y Coordinador)
exports.createCategory = [canCreate, async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validación mejorada
        if (!name?.trim()) {
            return res.status(400).json({ 
                success: false,
                message: 'El nombre de la categoría es obligatorio.'
            });
        }

        if (!description?.trim()) {
            return res.status(400).json({ 
                success: false,
                message: 'La descripción es obligatoria.'
            });
        }

        // Verificar si la categoría ya existe (case-insensitive)
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre.'
            });
        }

        const newCategory = new Category({
            name: name.trim(),
            description: description.trim(),
            createdBy: req.user.id // Registra el ID del usuario que creó la categoría
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: '✅ Categoría creada exitosamente',
            data: newCategory
        });

    } catch (error) {
        console.error('Error en createCategory:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Error: El nombre de la categoría ya existe.'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al crear la categoría',
            error: error.message
        });
    }
}];

// Obtener todas las categorías (todos los roles)
exports.getCategories = [canView, async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email role'); // Muestra info básica del creador

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error en getCategories:', error);
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener las categorías',
            error: error.message
        });
    }
}];

// Obtener categoría por ID (todos los roles)
exports.getCategoryById = [canView, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('createdBy', 'name role');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: '🔍 Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error en getCategoryById:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al obtener la categoría',
            error: error.message
        });
    }
}];

// Actualizar categoría (Admin y Coordinador)
exports.updateCategory = [canEdit, async (req, res) => {
    try {
        const { name, description } = req.body;
        const updateData = { 
            updatedBy: req.user.id // Registra quién actualizó
        };

        if (name?.trim()) {
            // Verificar si el nuevo nombre ya existe (ignorando el caso actual)
            const existing = await Category.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                _id: { $ne: req.params.id }
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: '⚠️ Ya existe una categoría con ese nombre'
                });
            }
            updateData.name = name.trim();
        }

        if (description?.trim()) {
            updateData.description = description.trim();
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: '🔍 Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: '🔄 Categoría actualizada exitosamente',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Error en updateCategory:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al actualizar la categoría',
            error: error.message
        });
    }
}];

// Eliminar categoría (Solo Admin)
exports.deleteCategory = [canDelete, async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: '🔍 Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: '🗑️ Categoría eliminada exitosamente',
            data: deletedCategory
        });
    } catch (error) {
        console.error('Error en deleteCategory:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al eliminar la categoría',
            error: error.message
        });
    }
}];