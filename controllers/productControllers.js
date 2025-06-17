const Product = require('../models/Products');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const { canCreate, canEdit, canDelete, canView } = require('../middlewares/role');

// Crear producto (Admin y Coordinador)
exports.createProduct = [canCreate, async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;

        // Validación mejorada con mensajes descriptivos
        if (!name?.trim()) {
            return res.status(400).json({ 
                success: false,
                message: '❌ El nombre del producto es obligatorio.'
            });
        }

        if (!description?.trim()) {
            return res.status(400).json({ 
                success: false,
                message: '❌ La descripción es obligatoria.'
            });
        }

        if (!price || price <= 0) {
            return res.status(400).json({ 
                success: false,
                message: '❌ El precio debe ser mayor a cero.'
            });
        }

        if (!stock || stock < 0) {
            return res.status(400).json({ 
                success: false,
                message: '❌ El stock no puede ser negativo.'
            });
        }

        if (!category) {
            return res.status(400).json({
                success: false,
                message: '❌ La categoría es requerida.'
            });
        }

        if (!subcategory) {
            return res.status(400).json({
                success: false,
                message: '❌ La subcategoría es requerida.'
            });
        }

        // Verificar que la categoría exista
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: '🔍 La categoría no existe'
            });
        }
        
        // Verificar que la subcategoría exista y pertenezca a la categoría
        const subcategoryExists = await Subcategory.findOne({
            _id: subcategory,
            category: category
        });
        if (!subcategoryExists) {
            return res.status(404).json({
                success: false,
                message: '🔍 La subcategoría no existe o no pertenece a la categoría especificada'
            });
        }
        
        // Verificar si el producto ya existe (case-insensitive)
        const existingProduct = await Product.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            category,
            subcategory
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: '⚠️ Ya existe un producto con ese nombre en esta categoría y subcategoría'
            });
        }

        // Crear el producto
        const product = new Product({
            name: name.trim(),
            description: description.trim(),
            price,
            stock,
            category,
            subcategory,
            createdBy: req.user.id // Asignar el usuario que creó el producto
        });

        const savedProduct = await product.save();

        // Obtener el producto con los datos poblados
        const productWithDetails = await Product.findById(savedProduct.id)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .populate('createdBy', 'name email role');

        res.status(201).json({
            success: true,
            message: '✅ Producto creado exitosamente',
            data: productWithDetails
        });
    } catch (error) {
        console.error('Error en createProduct:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: '❌ Ya existe un producto con ese nombre'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al crear el producto',
            error: error.message
        });
    }
}];

// Obtener todos los productos (todos los roles)
exports.getProducts = [canView, async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .populate('createdBy', 'name role')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error en getProducts:', error);
        res.status(500).json({
            success: false,
            message: '❌ Error al obtener los productos',
            error: error.message
        });
    }
}];

// Obtener producto por ID (todos los roles)
exports.getProductById = [canView, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name description')
            .populate('subcategory', 'name description')
            .populate('createdBy', 'name role');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: '🔍 Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error en getProductById:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: '❌ ID de producto inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al obtener el producto',
            error: error.message
        });
    }
}];

// Actualizar producto (Admin y Coordinador)
exports.updateProduct = [canEdit, async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;
        const updateData = { 
            updatedBy: req.user.id // Registra quién actualizó
        };

        // Validar y preparar los datos para actualización
        if (name?.trim()) {
            // Verificar si el nuevo nombre ya existe (ignorando el caso actual)
            const existing = await Product.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                _id: { $ne: req.params.id },
                category: category || undefined,
                subcategory: subcategory || undefined
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: '⚠️ Ya existe un producto con ese nombre en esta categoría y subcategoría'
                });
            }
            updateData.name = name.trim();
        }

        if (description?.trim()) updateData.description = description.trim();
        if (price !== undefined) updateData.price = price;
        if (stock !== undefined) updateData.stock = stock;

        // Validar relaciones si se actualizan
        if (category || subcategory) {
            if (category) {
                const categoryExists = await Category.findById(category);
                if (!categoryExists) {
                    return res.status(404).json({
                        success: false,
                        message: '🔍 La categoría especificada no existe'
                    });
                }
                updateData.category = category;
            }
            
            if (subcategory) {
                const catId = category || (await Product.findById(req.params.id)).category;
                const subcategoryExists = await Subcategory.findOne({
                    _id: subcategory,
                    category: catId
                });
                if (!subcategoryExists) {
                    return res.status(404).json({
                        success: false,
                        message: '🔍 La subcategoría especificada no existe o no pertenece a la categoría'
                    });
                }
                updateData.subcategory = subcategory;
            }
        }

        // Actualizar producto
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        )
        .populate('category', 'name')
        .populate('subcategory', 'name')
        .populate('updatedBy', 'name role');
        
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: '🔍 Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: '🔄 Producto actualizado exitosamente',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error en updateProduct:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: '❌ ID de producto inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al actualizar el producto',
            error: error.message
        });
    }
}];

// Eliminar producto (Solo Admin)
exports.deleteProduct = [canDelete, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: '🔍 Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: '🗑️ Producto eliminado exitosamente',
            data: deletedProduct
        });
    } catch (error) {
        console.error('Error en deleteProduct:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: '❌ ID de producto inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: '❌ Error al eliminar el producto',
            error: error.message
        });
    }
}];