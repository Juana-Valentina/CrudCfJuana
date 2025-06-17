const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const { canCreate, canEdit, canDelete, canView } = require('../middlewares/role');

// Crear subcategoría (Admin y Coordinador)
exports.createSubcategory = [canCreate, async (req, res) => {
    try {
        const { name, description, category } = req.body;

        // Validación mejorada
        if (!name?.trim()) {
            return res.status(400).json({ 
                success: false,
                message: '❌ El nombre de la subcategoría es obligatorio.'
            });
        }

        if (!description?.trim()) {
            return res.status(400).json({ 
                success: false,
                message: '❌ La descripción es obligatoria.'
            });
        }

        if (!category) {
            return res.status(400).json({
                success: false,
                message: '❌ La categoría padre es requerida.'
            });
        }

        // Validar que la categoría exista
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: '🔍 La categoría padre no existe'
            });
        }

        // Verificar si la subcategoría ya existe (case-insensitive)
        const existingSubcategory = await Subcategory.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            category
        });

        if (existingSubcategory) {
            return res.status(400).json({
                success: false,
                message: '⚠️ Ya existe una subcategoría con ese nombre en esta categoría.'
            });
        }

        const newSubcategory = new Subcategory({
            name: name.trim(),
            description: description.trim(),
            category,
            createdBy: req.user.id // Registra el ID del usuario que creó la subcategoría
        });

        await newSubcategory.save();

        res.status(201).json({
            success: true,
            message: '✅ Subcategoría creada exitosamente',
            data: newSubcategory
        });

    } catch (error) {
        console.error('Error en createSubcategory:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: '❌ Error: La subcategoría ya existe.'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al crear la subcategoría',
            error: error.message
        });
    }
}];

// Obtener todas las subcategorías (todos los roles)
exports.getSubcategories = [canView, async (req, res) => {
    try {
        const subcategories = await Subcategory.find()
            .sort({ createdAt: -1 })
            .populate('category', 'name')
            .populate('createdBy', 'name email role'); // Muestra info básica del creador

        res.status(200).json({
            success: true,
            count: subcategories.length,
            data: subcategories
        });
    } catch (error) {
        console.error('Error en getSubcategories:', error);
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener las subcategorías',
            error: error.message
        });
    }
}];

// Obtener subcategoría por ID (todos los roles)
exports.getSubcategoryById = [canView, async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id)
            .populate('category', 'name')
            .populate('createdBy', 'name role');

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: '🔍 Subcategoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: subcategory
        });
    } catch (error) {
        console.error('Error en getSubcategoryById:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: '❌ ID de subcategoría inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al obtener la subcategoría',
            error: error.message
        });
    }
}];

// Actualizar subcategoría (Admin y Coordinador)
exports.updateSubcategory = [canEdit, async (req, res) => {
    try {
        const { name, description, category } = req.body;
        const updateData = { 
            updatedBy: req.user.id // Registra quién actualizó
        };

        if (name?.trim()) {
            // Verificar si el nuevo nombre ya existe (ignorando el caso actual)
            const existing = await Subcategory.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                _id: { $ne: req.params.id },
                category: category || undefined
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: '⚠️ Ya existe una subcategoría con ese nombre en esta categoría'
                });
            }
            updateData.name = name.trim();
        }

        if (description?.trim()) {
            updateData.description = description.trim();
        }

        if (category) {
            // Validar que la nueva categoría exista
            const parentCategory = await Category.findById(category);
            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: '🔍 La categoría padre no existe'
                });
            }
            updateData.category = category;
        }

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedSubcategory) {
            return res.status(404).json({
                success: false,
                message: '🔍 Subcategoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: '🔄 Subcategoría actualizada exitosamente',
            data: updatedSubcategory
        });
    } catch (error) {
        console.error('Error en updateSubcategory:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: '❌ ID de subcategoría inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al actualizar la subcategoría',
            error: error.message
        });
    }
}];

// Eliminar subcategoría (Solo Admin)
exports.deleteSubcategory = [canDelete, async (req, res) => {
    try {
        const deletedSubcategory = await Subcategory.findByIdAndDelete(req.params.id);

        if (!deletedSubcategory) {
            return res.status(404).json({
                success: false,
                message: '🔍 Subcategoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: '🗑️ Subcategoría eliminada exitosamente',
            data: deletedSubcategory
        });
    } catch (error) {
        console.error('Error en deleteSubcategory:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: '❌ ID de subcategoría inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al eliminar la subcategoría',
            error: error.message
        });
    }
}];