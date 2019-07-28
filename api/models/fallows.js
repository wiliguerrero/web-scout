'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FallowSchema = Schema({
    user: { type: Schema.ObjectId, ref:'User'},
    fallowed: { type: Schema.ObjectId, ref:'User'},
});


module.exports = mongoose.model('Fallow',FallowSchema);