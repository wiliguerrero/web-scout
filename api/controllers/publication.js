'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate=require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Fallow = require('../models/fallows');

function probando(req,res){
    res.status(200).send({message: "Hola perris"});

}

function savePublication(req,res){
    var params = req.body;
    
   ;
    if(!params.text){
       return res.status(200).send({message: 'Debes enviar un texto!!'});

    }

     var publication = new Publication()
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err,publicationStored)=>{
        if(err) return res.status(500).send({message:'error al guardar la publicacion'});

        if(!publicationStored) return res.status(404).send({message:'La publicacion no ha sido guardada'});

return res.status(200).send({publication:publicationStored});
    });

}

function getPublications(req,res){
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage=4;

    Fallow.find({user:req.user.sub}).populate('fallowed').exec((err,fallows)=>{
        if(err) return res.status(500).send({message:'error al devolver el seguimiento'});

        var fallows_clean = [];

        fallows.forEach((fallow)=>{
            fallows_clean.push(fallow.fallowed);

        });

        Publication.find({user:{"$in": fallows_clean}}).sort('-created_at').populate('user').paginate(page,itemsPerPage,(err,publications,total)=>{
            if(err) return res.status(500).send({message:'error al devolver publicaciones'});

            if(!publications) return res.status(404).send({message: 'no hay publicaciones'});

            return res.status(200).send({
                total_items: total,
                pages:Math.ceil(total/itemsPerPage),
                page:page,
                publications
            
            });
        });
        


    });
}

function getPublication(req,res){
    var pubicationId=req.params.id;

    Publication.findById(pubicationId,(err,publication)=>{
        if(err) return res.status(500).send({message:'error al devolver publicaciones'});

        if(!publication) return res.status(404).send({message: 'No existe we'});

        return res.status(200).send({publication});
    });

}

function deletePublication(req,res){
    var pubicationId=req.params.id;

    Publication.find({user:req.user.sub,'_id': pubicationId}).remove(err=>{
        if(err) return res.status(500).send({message:'error al borrar la publicacion'});

        if(!publicationRemove) return res.status(404).send({message: 'No se borro we'});

        return res.status(200).send({message:'Publicacion eliminada correctamente'});
    });
}

//subir archivos de imagen
function uploadImage(req,res){
    var publicationId = req.params.id;
    
    if(req.files){
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split('\\');  
        var file_name = file_split[2];             
        var exp_split = file_name.split('\.');      
        var file_ext = exp_split[1];
        
        

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext =='jpge' || file_ext == 'gif'){
           Publication.findOne({'user': req.user.sub,'_id':publicationId}).exec((err,publication)=>{

               if(publication){
                Publication.findByIdAndUpdate(publicationId,{file:file_name},{new:true},(err,publicationUpdate)=>{
                    if(err) return res.status(500).send({message:'error en la peticion'});
    
                    if(!publicationUpdate) return res.status(404).send({ message : 'No se a podido actualizar el usuario'});
            
                    return res.status(200).send({publication:publicationUpdate});
                });
               }else{
                return removeFilesOfUpload(res,file_path,'No tienes permiso para actualizar esta publicacion');
               }
           })
            //actualizar documento de publicacion
           
        }else{
          return removeFilesOfUpload(res,file_path,'Extencion no valida');
           
        }


    }else{
        return res.status(200).send({message:'no se han subiro archivos'});
    }
}

function removeFilesOfUpload(res,file_path,message){
    fs.unlink(file_path,(err)=>{
         return res.status(200).send({message: message});

    });
}

function getImageFile(req,res){
    var image_file = req.params.imageFile;
    var path_file = './upload/publications/'+image_file;

    fs.exists(path_file,(exists)=>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}

module.exports={
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}