const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

// Crear subcategoría
exports.createSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;

        // Validar que la categoría exista
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: 'La categoría no existe'
            });
        }

        const newSubcategory = new Subcategory({
            name: name.trim(),
            description: description.trim(),
            category
        });

        await newSubcategory.save();

        res.status(201).json({
            success: true,
            message: 'Subcategoría creada exitosamente',
            data: newSubcategory
        });

    } catch (error) {
        console.error('Error en createSubcategory:', error);

        if (error.message.includes('duplicate key') || error.message.includes('ya existe')) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una subcategoría con ese nombre'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear subcategoría'
        });
    }
};

// Obtener subcategorías
exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate({ path: 'category', select: 'name', model: 'Category' });
    res.status(200).json({
      success: true,
      message: 'Subcategorías obtenidas exitosamente',
      data: subcategories
    });
  } catch (error) {
    console.error('Error en getSubcategories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener subcategorías'
    });
  }
};

// Obtener subcategoría por id
exports.getSubcategoryById = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id).populate({ path: 'category', select: 'name', model: 'Category' });
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Subcategoría obtenida exitosamente',
            data: subcategory
        });
    } catch (error) {
        console.error('Error al obtener la subcategoría', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener subcategoría'
        });
    }
};

// Actualizar subcategoría
exports.updateSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;

        // Validar si se envió categoría y si existe
        if (category) {
            const parentCategory = await Category.findById(category);
            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'La categoría no existe'
                });
            }
        }

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            req.params.id,
            {
                name: name ? name.trim() : undefined,
                description: description ? description.trim() : undefined,
                category
            },
            { new: true, runValidators: true }
        );

        if (!updatedSubcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subcategoría actualizada',
            data: updatedSubcategory
        });
    } catch (error) {
        console.error('Error al actualizar la subcategoría', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la subcategoría'
        });
    }
};

// Eliminar subcategoría
exports.deleteSubcategory = async (req, res) => {
    try {
        const deletedSubcategory = await Subcategory.findByIdAndDelete(req.params.id);
        if (!deletedSubcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Subcategoría eliminada',
        });
    } catch (error) {
        console.error('Error al eliminar la subcategoría', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la subcategoría'
        });
    }
};
