const mongoose = require('mongoose'); // Corrige aquí

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        unique: true
    },
    description:{
        type:String,
        required:[true, ' la descripcion es obligatoria'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    stock: {
        type: Number,
        required: [true, 'El stock es requerido'],
        min: [0, 'El stock no puede ser negativo']
    },
    category:{ // Corrige el nombre aquí
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'La categoria es requerida']
    },
    subcategory:{ // Corrige el nombre aquí
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcategory',
        required:[ true, 'La subcategoria es requerida']
    },
    images: [{
        type: String
    }]
}, {
    timestamps: true,
    versionKey: false
});

//Manejo de errores de duplicados
productSchema.post('save', function(error, doc, next){
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('El nombre del producto ya existe'));
    } else {
        next(error);
    }
});

module.exports = mongoose.model('Product', productSchema);