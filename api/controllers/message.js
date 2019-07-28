'use strict'

var moment=require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Message = require('../models/message');
var User = require('../models/user');
var Fallow = require('../models/fallows');

function probando(req,res){
    res.status(200).send({message:'Holaaaa'});
}

function saveMessge(req,res){
    var params = req.body;

    if(!params.text || !params.receiver)  return res.status(200).send({message:'Envia los campos necesarios'});

    var message = new Message();
    message.emmiter=req.user.sub;
    message.receiver=params.receiver;
    message.text=params.text;
    message.create_at= moment().unix();
    message.viewed = 'false';

    message.save((err,messageStored)=>{
         if(err)  return res.status(200).send({message:'Envia los campos necesarios'});

         if(!messageStored)  return res.status(200).send({message:'Error al enviar el mensaje'});

         return res.status(200).send({message:messageStored});

    });

     
    
}

function getReceivedMessages(req,res){
    var userId = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage=4;

    Message.find({receiver:userId}).populate('emmiter','name surname _id image nick').paginate(page,itemsPerPage,(err,messages,total)=>{
        if(err)  return res.status(500).send({message:'Error en la peticion'});
        if(!messages)  return res.status(404).send({message:'No hay mensahes'});

        return res.status(200).send({
            total:total,
            page:Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

function getEmmitMessages(req,res){
    var userId = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage=4;

    Message.find({emmiter:userId}).populate('emmiter receiver','name surname _id image nick').paginate(page,itemsPerPage,(err,messages,total)=>{
        if(err)  return res.status(500).send({message:'Error en la peticion'});
        if(!messages)  return res.status(404).send({message:'No hay mensahes'});

        return res.status(200).send({
            total:total,
            page:Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

function getUnviewedMessages(req,res){
    var userId= req.user.sub;

    Message.count({receiver:userId,viewed:'false'}).exec((err,count)=>{
        if(err)  return res.status(500).send({message:'Error en la peticion'});
        
        return res.status(200).send({'unviewed': count});
    })
}

function serViewedMessages(req,res){
    var userId= req.user.sub;

    Message.update({receiver:userId,viewed:'false'},{viewed:'true'},{"multi":true},(err,messageUpdate)=>{
        if(err)  return res.status(500).send({message:'Error en la peticion'});

        return res.status(200).send({messages:messageUpdate});
              
    });

}
module.exports={
    probando,
    saveMessge,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    serViewedMessages
}