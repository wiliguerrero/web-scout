'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Fallow = require('../models/fallows');

function saveFallow(req,res){
    var params = req.body;
    var fallow = new Fallow();

    fallow.user = req.user.sub;
    fallow.fallowed = params.fallowed;

    fallow.save((err,fallowStored)=>{
        if(err) return res.status(500).send({message: 'Error al guardar el seguimiento'});

        if(!fallowStored) return res.status(404).send({message:'El seguimiento no se ha guardado'});

        return res.status(200).send({fallow:fallowStored});
    })
}

function deleteFallow(req,res){
    var userId = req.user.sub;
    var fallowId = req.params.id;

    Fallow.find({'user': userId,'fallowed':fallowId}).remove(err=>{
        if(err) return res.status(500).send({message: 'Error al dejar de seguimiento'});

        return res.status(200).send({message:'el fallow se ha eliminado'});
    });
}

function getFallowingUser(req,res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;        
    }
    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemsPerPage = 4

    Fallow.find({user:userId}).populate({path:'fallowed'}).paginate(page,itemsPerPage,(err,fallows,total)=>{
        if(err) return res.status(500).send({message: 'Error al dejar de seguimiento'});

        if(!fallows) return res.status(404).send({message: 'NO ESTAS SIGUIENDO NIGNUN USUARIO'});

        return res.status(200).send({
            total:total,
            pages:Math.ceil(total/itemsPerPage),
            fallows
        });
    });
}

function getFallowedUsers(req,res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;        
    }
    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemsPerPage = 4

    Fallow.find({fallowed:userId}).populate('user').paginate(page,itemsPerPage,(err,fallows,total)=>{
        if(err) return res.status(500).send({message: 'Error al dejar de seguimiento'});

        if(!fallows) return res.status(404).send({message: 'NO te sigue ningun usuario NIGNUN USUARIO'});

        return res.status(200).send({
            total:total,
            pages:Math.ceil(total/itemsPerPage),
            fallows
        });
    });

}

//devolver usuarios que sigo
function getMyFallows(req,res){
    var userId = req.user.sub;

    var find = Fallow.find({user:userId});
    if(req.params.fallowed){
        find = Fallow.find({fallowed:userId});
    }
    
    find.populate('user fallowed').exec((err,fallows)=>{
        if(err) return res.status(500).send({message: 'Error al dejar de seguimiento'});

        if(!fallows) return res.status(404).send({message: 'No sigues a ningun usuario'});

        return res.status(200).send({fallows});
    });
}

//devolver usuarios que me siguen


module.exports = {
    saveFallow,
    deleteFallow,
    getFallowingUser,
    getFallowedUsers,
    getMyFallows
}
