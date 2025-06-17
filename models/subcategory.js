const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // ¡IMPORTANTE! Debe coincidir exactamente con cómo definiste el modelo Category
        required: [true, '❌ La categoría es requerida']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { 
    timestamps: true,
    versionKey: false
});

// Manejo de errores de duplicados
subcategorySchema.post('save', function(error, doc, next) {
    if(error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('⚠️ Ya existe una subcategoría con ese nombre'));
    } else {
        next(error);
    }
});

// Cambia esto para que coincida con la referencia
module.exports = mongoose.model('Subcategory', subcategorySchema);