const Product = require('../models/Products');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
     

exports.createProduct = async (req, res) => {
    try {
        const {name, description, price, stock, category, subcategory}  = req.body;

        //Validacion de campos requridos
        if (!name || !description || !price || !stock || !category || !subcategory) {

            return res.status(400).json({
                success:false,
                message:'Todos los campos son obligatorios'
            });
        }   
        //Verificar que la categoria exista
        
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'La categoria no existe'
            });
        }
        
        //verificar que la subcategoria exista y pertenezca a la categoria
        const subcategoryExists = await Subcategory.findOne({
            _id: subcategory,
            category: category
        });
        if(!subcategoryExists){
            return res.status(404).json({
                success: false,
                message:('La subcategoria no existe o no pertenece a la categoria especifica')
            });
        }
        
        //crar  el producto sin el createBy temporalmente
        const product = new Product({
            name,
            description,
            price,
            stock,
            category,
            subcategory
            //createBy se asignara en el verificar usuarios
        });

        //verificar si el usuario esta disponible en el request
        if (req.user && req.user.id){
            product.createdBy = req.user.id;
        }

        //Guardar en la base de datos
        const savedProduct = await product.save();

        //Obtener el producto con los datos poblados
        const productWithDetails = await Product.findById(savedProduct.id)
        .populate('category', 'name')
        .populate('subcategory','name');

        res.status(201).json({
            success:true,
            message:('producto creado exitosamente'),
            data: productWithDetails
        });
    }catch (error) {
        console.error('error en createdProduct;', error);

        //manejo de erroes en mongoDB
        if (error.code === 11000) {
            return res.status(400).json({
                success:false,
                message:'Ya existe un producto con ese nombre'

            });

            }
            res.status(500).json({
                success:false,
                message:'error al crear el producto',
                error:  error.message
            });
        }
    };

    //Consulta de productos GET api/products
    exports.getProducts = async (req, res) => {
        try{
            const products = await Product.find()
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({createAt: -1});
            
            res.status(200).json({
                success:true,
                count: products.length,
                data: products

            });
        }catch (error) {
            console.error('Error en getProducts:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los productos'
            });
        }
    };


exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name description')
            .populate('subcategory', 'name description');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: product
            });
    } catch (error) {
        console.error('Error en getProductById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const {name, description, price, stock, category, subcategory} = req.body;
        const updateData = {};

        //validar y prearar los datos para actualizacion
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = price;
        if (stock) updateData.stock = stock;
        if (category) updateData.category = category;
        if (subcategory) updateData.subcategory = subcategory;

        //validar relaciones si se actualizan 
        if (category || subcategory) {
            if (category) {
                const categoryExists  = await Category.findById(category);
                if (!categoryExists) {
                    return res.status(404).json({
                        success: false,
                        message:'La categoria especificada no existe'
                    });
                }
                updateData.category = category;
            }
            if (subcategory) {
                const subcategoryExists = await Subcategory.findOne({
                    _id: subcategory,
                    category: category || updateData.category
                });
                if (!subcategoryExists) {
                    return res.status(404).json({
                        success: false,
                        message: 'La subcategoria especificada no existe o no pertenece a la categoria especifica'
                    });
                }
                updateData.subcategory = subcategory;
            }
        }

        //Actualizar producto
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        )
        .populate('category', 'name')
        .populate('subcategory', 'name');
        
        if (!this.updateProduct){
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: updatedProduct
        });

    } catch (error) {
        console.error('Error en updateProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente',
            data: product
        });
    } catch (error) {
        console.error('Error en deleteProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
        });
    }
};