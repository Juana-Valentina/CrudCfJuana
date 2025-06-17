const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'El nombre es requerido'],
        trim: true,
        unique:true
    },
    description:{
        type: String,
        required: [true, 'La descripcio es requerida'],
        trim:true
    },
    category:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'category',
    required: [true, 'La categoria es requerida']
    }
},{
    timestamps: true,
    versionKey: false
});

//Manejp de errores de duplicados
subcategorySchema.post('save', function(error, doc, next){
    if(error.name === 'MongoServerError' && error.code === 11000){
        next(new Error('ya existe una subcategoria con ese nombre'));
    }else{
        next(error)
    }
});

module.exports = mongoose.model('subcategory', subcategorySchema);


