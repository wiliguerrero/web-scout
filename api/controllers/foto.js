'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
const cloudinary = require('cloudinary');
var Foto = require('../models/foto');
var User = require('../models/user');
var Follow = require('../models/follow');
var fs=require('fs-extra');
var User = require('../models/user');


cloudinary.config({
    cloud_name: 'dfpuxxtqz',
    api_key: '942481193345364',
    api_secret: 'ZAb_1D9MMleCJs4XzMtFIkIkA1U'
});
function probando(req, res){
	res.status(200).send({
		message: "Hola desde el CONTROLADOR DE PUBLICACIONES"
	});
}

async function saveFoto(req, res){

	//console.log(' Aqui esta mi body '+req.body);
	
	var userId = req.params.id;
	const result = await cloudinary.v2.uploader.upload(req.file.path)
	console.log(result);
   
    const foto =	new Foto({
	file : result.url,
	user : userId,
	public_id :result.public_id
	});
	console.log('Aqui estan mis datos de mi foto --->'+foto);
	

	await foto.save();
	/*(err, publicationStored) => {
		if(err) return res.status(500).send({message: 'Error al guardar la publicación'});

		if(!publicationStored) return res.status(404).send({message: 'La publicación NO ha sido guardada'});

		return res.status(200).send({publication: publicationStored});
	});*/
	await fs.unlink(req.file.path);
	//console.log(" Aqui esta mi url para insertar "+result.url + " Este es mi ID " +title );
	const us = await User.findById(userId);
	us.image = result.url;
	console.log('mi nuevo usuario es  '+us);
	await User.findByIdAndUpdate(userId,us);	
	res.json({ status: "Foto saved!" });
}

function getPublications(req, res){
	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
		if(err) return res.status(500).send({message: 'Error devolver el seguimiento'});

		var follows_clean = [];

		follows.forEach((follow) => {
			follows_clean.push(follow.followed);
		});
		follows_clean.push(req.user.sub);

		Publication.find({user: {"$in": follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
			if(err) return res.status(500).send({message: 'Error devolver publicaciones'});

			if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

			return res.status(200).send({
				total_items: total,
				pages: Math.ceil(total/itemsPerPage),
				page: page,
				items_per_page: itemsPerPage,
				publications
			});
		});

	});
}

async function getFotosUser(req, res, next){
	const { id } = req.params;
	const employee = await	Foto.find({user:id}, (err, user) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});

		if(!user) return res.status(404).send({message: 'La foto no existe'});

		return res.json(user);
		
	});
	
	console.log('Aqui van tus foto ' + employee);
};

function getPublicationsUser(req, res){
	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var user = req.user.sub;
	if(req.params.user){
		user = req.params.user;
	}

	var itemsPerPage = 4;

	Publication.find({user: user}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
		if(err) return res.status(500).send({message: 'Error devolver publicaciones'});

		if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

		return res.status(200).send({
			total_items: total,
			pages: Math.ceil(total/itemsPerPage),
			page: page,
			items_per_page: itemsPerPage,
			publications
		});
	});

}

async function getFoto(req, res, next){
	const { id } = req.params;
	const employee = await	Foto.findOne({user:id}, (err, user) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});

		if(!user) return res.status(404).send({message: 'La foto no existe'});

		return res.json(user);
		
	});
	
	console.log('Aqui va tu foto ' + employee);
};

/*async function getFoto(req, res){

	const { id } = req.params;
	const employee = await	Foto.findOne({user:id});
	console.log(employee);
    res.json(employee);

	

 /*const publication = await	Foto.find({user:foto}, (err, foto) => {
		if(err) return res.status(500).send({message: 'Error devolver publicaciones'});

		if(!foto) return res.status(404).send({message: 'No existe la publicación'});

		return res.status(200).send({foto});

		
	});

	console.log('Aqui esta tu  foto'+publication);

	
}
*/
function deletePublication(req, res){
	var publicationId = req.params.id;

	Foto.find({'_id': publicationId}).remove(err => {
		if(err) return res.status(500).send({message: 'Error al borrar publicaciones'});
		
		return res.status(200).send({message: 'Publicación eliminada correctamente'});
	});
}

// Subir archivos de imagen/avatar de usuario
function uploadImage(req, res){
	var publicationId = req.params.id;

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];
	
		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
			 
			Publication.findOne({'user':req.user.sub, '_id':publicationId}).exec((err, publication) => {
				console.log(publication);
				if(publication){
					 // Actualizar documento de publicación
					 Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new:true}, (err, publicationUpdated) =>{
						if(err) return res.status(500).send({message: 'Error en la petición'});

						if(!publicationUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

						return res.status(200).send({publication: publicationUpdated});
					 });
				}else{
					return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar esta publicacion');
				}
			});
				 

		}else{
			return removeFilesOfUploads(res, file_path, 'Extensión no válida');
		}

	}else{
		return res.status(200).send({message: 'No se han subido imagenes'});
	}
}

function removeFilesOfUploads(res, file_path, message){
	fs.unlink(file_path, (err) => {
		return res.status(200).send({message: message});
	});
}

function getImageFile(req, res){
	var image_file = req.params.imageFile;
	var path_file = './uploads/publications/'+image_file;

	fs.exists(path_file, (exists) => {
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message: 'No existe la imagen...'});
		}
	});
}

module.exports = {
	probando,
	saveFoto,
	getPublications,
	getPublicationsUser,
	getFoto,
	getFotosUser,
	deletePublication,
	uploadImage,
	getImageFile
}