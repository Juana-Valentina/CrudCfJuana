const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '❌ El nombre es requerido'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, '❌ La descripción es requerida'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, '❌ El precio es requerido'],
        min: [0, '❌ El precio no puede ser negativo']
    },
    stock: {
        type: Number,
        required: [true, '❌ El stock es requerido'],
        min: [0, '❌ El stock no puede ser negativo']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Referencia al modelo Category (debe coincidir exactamente)
        required: [true, '❌ La categoría es requerida']
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory', // ¡IMPORTANTE! Cambiado a 'Subcategory' para coincidir con el modelo
        required: [true, '❌ La subcategoría es requerida']
    },
    images: [{
        type: String,
        trim: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referencia al modelo User
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referencia al modelo User
    }
}, { 
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false // Elimina el campo __v
});

// Manejo de errores de duplicados
productSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('⚠️ Ya existe un producto con ese nombre'));
    } else {
        next(error);
    }
});

// Middleware para validar referencias antes de guardar
productSchema.pre('save', async function(next) {
    try {
        // Validar que la categoría exista
        const categoryExists = await mongoose.model('Category').exists({ _id: this.category });
        if (!categoryExists) {
            throw new Error('🔍 La categoría especificada no existe');
        }

        // Validar que la subcategoría exista y pertenezca a la categoría
        const subcategoryExists = await mongoose.model('Subcategory').exists({ 
            _id: this.subcategory,
            category: this.category
        });
        if (!subcategoryExists) {
            throw new Error('🔍 La subcategoría no existe o no pertenece a la categoría especificada');
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Product', productSchema);