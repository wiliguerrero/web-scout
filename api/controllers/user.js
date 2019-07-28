'use strict'

var User = require('../models/user');
var Fallow = require('../models/fallows');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
var Publication = require('../models/publication');



function home(req,res){
    res.status(200).send({
            message : 'Hola mundo'
    });
};

function pruebas(req,res){
    res.status(200).send({
            message : 'Accion de pruebas en el servidor'
    });
};

function saveUser(req,res){
    var params = req.body;
    var user = new User();

    if(params.name && params.surname && params.nick && params.email && params.password && params.cum){
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.cum = params.cum;
        user.role = "ROLE_USER";
        user.image = null;

        //controlar  usuarios duplicados
        User.find({ $or: [
                        {email: user.email.toLowerCase()},
                        {nick: user.nick.toLowerCase()},
                        {cum : user.cum.toLowerCase()}
                       
                    ]}).exec((err,users)=>{
                        if(err) return res.status(500).send({message : "Error en la peticion de usuarios."});

                        if(users && users.length >= 1){
                            return res.status(200).send({message : "El usuario que intenta registrar, ya existe."});
                        }else{
                            bcrypt.hash(params.password, null,null,(err,hash)=>{
                                user.password = hash;
                    
                                user.save((err,userStored)=>{
                                    if(err) return res.status(500).send({message:"error al guardar el usuario"});
                                
                                    if(userStored){
                                        res.status(200).send({user : userStored});                    
                                    }else{
                                        res.status(404).send({message : "No se ha registrado el usuario"});                    
                                    }
                                });
                            });
                        }
                    });
        
        
    }else{
        res.status(200).send({
            message: "Envia todos los campos necesarios!!"
        });
    }
}

function loginUser(req,res){
    var params = req.body

    var email = params.email;
    var password = params.password;

    User.findOne({email:email}, (err,user)=>{
            if(err) return res.status(500).send({ message: 'Error en la peticion'});

            if(user){
                bcrypt.compare(password,user.password,(err,check)=>{
                    if(check){
                        if(params.gettoken){
                            //devolver token                            
                            //generar el token
                            return res.status(200).send({
                                token:jwt.createToken(user)
                            }); 

                        }else{
                            //devolver datos de usuario
                            user.password = undefined;
                            return res.status(200).send({user});
                        }
                        
                        
                    }else{
                        return res.status(404).send({message : 'El usuario no se ha podido identificar'});
                    }
                });
            }else{
                return res.status(404).send({message : 'El usuario no se ha podido identificar'});
            }
    });
}

//conseguir datos de un usuarii
function getUser(req,res){
    var userID = req.params.id;

    User.findById(userID,(err,user)=>{
        if(err) return res.status(500).send({message:'error en la peticion'});
    
        if(!user) return res.status(404).sent({message:'user no existe'});


        followThisUsers(req.user.sub,userID).then((value)=>{
            return res.status(200).send({user,
                fallowing:value.following,
                fallowed:value.followed});
        });
            /*Fallow.findOne({'user': req.user.sub,"fallowed":userID}).exec((err,fallow)=>{
            if(err) return res.status(500).send({message:'error al comprobar el seguimiento'});
            

            return res.status(200).send({user,fallow});
        });*/
        
    });
}

async function followThisUsers(identity_user_id, user_id) {
    var following = await Fallow.findOne({ "user": identity_user_id, "fallowed": user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });
 
    var followed = await Fallow.findOne({ "user": user_id, "fallowed": identity_user_id }).exec().then((follow) => {
        console.log(follow);
        return follow;
    }).catch((err) => {
        return handleError(err);
    });
 
 
    return {
        following: following,
        followed: followed
    }
}

//devolver un listado de usuarios paginados
function getUsers(req,res){
    var identity_user_id = req.user.sub;
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage=5;
    User.find().sort('_id').paginate(page,itemsPerPage,(err,users,total)=>{
        if(err) return res.status(500).send({message:'error en la peticion'});

        if(!users) return res.status(404).send({message:'No hay usuarios disponibles'});

        followUserIds(identity_user_id).then((value)=>{
            return res.status(200).send({
                users,
                users_fallowing:value.fallowing,
                users_fallo_me:value.fallowed,
                total,
                pages:Math.ceil(total/itemsPerPage)
            });
        });       
    });
}


async function followUserIds(user_id){

    var fallowing = await Fallow.find({"user": user_id}).select({'_id': 0, '__uv': 0, 'user': 0}).exec().then((fallows)=>{
        var fallows_clean=[];
        fallows.forEach((fallow)=>{  
        fallows_clean.push(fallow.fallowed);
    });
    console.log(fallows_clean);
    return fallows_clean;
    }).catch((err)=>{
    return handleerror(err);
    });
    
    
    
    var fallowed = await Fallow.find({"fallowed": user_id}).select({'_id': 0, '__uv': 0, 'fallowed': 0}).exec().then((fallows)=>{
        var fallows_clean=[];
        fallows.forEach((fallow)=>{ 
        fallows_clean.push(fallow.user);
    
    });
         return fallows_clean;
    }).catch((err)=>{    
         return handleerror(err);
    });
    
    
    
    console.log(fallowing);
    
    return {
        fallowing: fallowing,
        fallowed: fallowed
    }
    
}

function getCounters(req,res){
    var userId = req.user.sub;
    if(req.params.id){
       userId = req.params.id;
    }
        getCountFallow(userId).then((value)=>{
            return res.status(200).send({valor:value});
        });
    
}

async function getCountFallow(user_id){
    try{
    var fallowing = await Fallow.count({"user":user_id}).exec()
    .then(count=>{
    return count;
    })
    .catch((err)=>{
    return handleError(err);
    
    });
    
    var fallowed = await Fallow.count({"fallowed":user_id}).exec()
    .then(count=>{
    return count;
    })
    .catch((err)=>{
    return handleError(err);
    });

    var publications = await Publication.count({"user":user_id}).exec().then(count => {
        return count;
      }).catch((err) => {
          if(err) return handleError(err);
      });
    
    return {
        fallowing:fallowing,
        fallowed:fallowed,
    publications:publications
    }
    
    }catch(e){
    console.log(e);
    }
}

//edicion de datos de usuari
function updateUser(req,res){
    var userId=req.params.id;
    var update = req.body;

    //borrar la propiedad password
    delete update.password;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'no tienes permiso para actualizar los datos del usuario'});        
    }

    User.find({ $or: [
        {email: update.email.toLowerCase()},
        {nick: update.nick.toLowerCase()},
        {cum : update.cum.toLowerCase()}
    ]}).exec((err,users)=>{
        var user_isset = false
        users.forEach((user)=>{
            if(user && user._id!=userId )  user_isset = true;

        });
        if(user_isset) return res.status(500).send({message:'Los datos ya estan en uso'});
 
        User.findByIdAndUpdate(userId,update,{new:true},(err,userUpdate)=>{
            if(err) return res.status(500).send({message:'error en la peticion'});
    
            if(!userUpdate) return res.status(404).send({ message : 'No se a podido actualizar el usuario'});
    
            return res.status(200).send({user:userUpdate});
    
        });

    })

   
}

//subir archivos de imagen
function uploadImage(req,res){
    var userId = req.params.id;

    
    
    if(req.files){
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split('\\');
        console.log(file_split);    

        var file_name = file_split[2];        
        console.log(file_name);

        var exp_split = file_name.split('\.');
        console.log(exp_split);

        var file_ext = exp_split[1];
        console.log(file_ext);
        if(userId != req.user.sub){                        
            return removeFilesOfUpload(res, file_path, 'no tienes permiso para actualizar los datos del usuario');
        }

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext =='jpge' || file_ext == 'gif'){
            //actualizar documento de usuario
            User.findByIdAndUpdate(userId,{image:file_name},{new:true},(err,userUpdate)=>{
                if(err) return res.status(500).send({message:'error en la peticion'});

                if(!userUpdate) return res.status(404).send({ message : 'No se a podido actualizar el usuario'});
        
                return res.status(200).send({user:userUpdate});
            });
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
    var path_file = './upload/users/'+image_file;

    fs.exists(path_file,(exists)=>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}
module.exports={
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
}