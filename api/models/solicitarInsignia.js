const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema = new Schema({
    
        insignia: { type: String, required: true},
        color: { type: String, required: true},
        fecha: { type: Date, required: true },
        nombre: { type: String, required: true},
        cum: { type: String, required: true},
        areaCabuyeria:{ type:String,required: false}, 
        areaCapismo:{ type:String,required: false}, 
        areaExploracion:{ type:String,required: false},         
        destresa1:{ type:String,required: false},
        destresa2:{ type:String,required: false},
        destresa3:{ type:String,required: false},
        archivoEvidencia:{ type:String,required: false},
        seccion:{ type:String,required: true},
        solicitante: { type: Schema.ObjectId, ref:'User' },
});

module.exports = mongoose.model('SolicitudInsignia', employeeSchema);