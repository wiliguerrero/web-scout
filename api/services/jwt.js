'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_scouts';
exports.createToken = function(user){
        var payload = {
            sub: user._id,
            name: user.name,
            nick:user.nick,
            surname:user.surname,
            email:user.email,
            rol:user.rol,
            image:user.image,
            cum:user.cum,
            iat:moment().unix,
            exp:moment().add(30,'days').unix
        };

        return jwt.encode(payload, secret);
};