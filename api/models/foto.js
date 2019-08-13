'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Photo = Schema({		
		file: String,
        public_id:String,
		user: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Photo', Photo);