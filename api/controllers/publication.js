'use strict'

//var path = require('path');

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
const cloudinary = require('cloudinary');
var Publication = require('../models/publication');
var Foto = require('../models/foto');
var User = require('../models/user');
var fs=require('fs-extra');
var Follow = require('../models/follow');


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

/*async function savePublication(req, res){
const { title, description } = req.body;
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const publicacion = new Publication({
        user:title,
        text:description,               
		file: result.url,
		created_at:moment().unix(),
        public_id: result.public_id
	});

console.log('Mi publicacion lleva lo siguiente ' + publicacion);
    await publicacion.save((err, publicationStored) => {
		if(err) return res.status(500).send({message: 'Error al guardar la publicación'});

		if(!publicationStored) return res.status(404).send({message: 'La publicación NO ha sido guardada'});

		return res.status(200).send({publication: publicationStored});
	});

    await fs.unlink(req.file.path);
    //res.json({ status: "Menu saved!" });


	var params = req.body;
	const result = await cloudinary.v2.uploader.upload(req.file.path);
	console.log('Aqui esta el result' + result);
	if(!params.text) return res.status(200).send({message: 'Debes enviar un texto!!'});

	var publication = new Publication();
	publication.text = params.text;
	publication.file = 'null';
	publication.user = req.user.sub;
	publication.created_at = moment().unix();

	publication.save((err, publicationStored) => {
		if(err) return res.status(500).send({message: 'Error al guardar la publicación'});

		if(!publicationStored) return res.status(404).send({message: 'La publicación NO ha sido guardada'});

		return res.status(200).send({publication: publicationStored});
	});

}*/

async function savePublication(req, res){

	//console.log(' Aqui esta mi body ' + req.body);
	const {description} = req.body;
	var userId = req.params.id;
	console.log("AQUI ESTAA MI ID PARA METER A LA PUB " + userId);
	const result = await cloudinary.v2.uploader.upload(req.file.path)
	console.log(result);
 
    const pub =	new Publication({
	text : description,
	file : result.url,
	user:userId,
	created_at:moment().unix(),
	public_id :result.public_id
	});

	const foto = new Foto({
		file:result.url,
		public_id:result.public_id,
		user:userId
	});
	console.log('Aqui estan mis datos de mi foto --->'+pub );
	

	await pub.save();
	await foto.save();
	/*(err, publicationStored) => {
		if(err) return res.status(500).send({message: 'Error al guardar la publicación'});

		if(!publicationStored) return res.status(404).send({message: 'La publicación NO ha sido guardada'});

		return res.status(200).send({publication: publicationStored});
	});*/
	await fs.unlink(req.file.path);
	//console.log(" Aqui esta mi url para insertar "+result.url + " Este es mi ID " +title );
	
	res.json({ status: "publicacion saved!" });
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

function getPublication(req, res){
	var publicationId = req.params.id;

	Publication.findById(publicationId, (err, publication) => {
		if(err) return res.status(500).send({message: 'Error devolver publicaciones'});

		if(!publication) return res.status(404).send({message: 'No existe la publicación'});

		return res.status(200).send({publication});
	});
}

function deletePublication(req, res){
	var publicationId = req.params.id;

	Publication.find({'user': req.user.sub, '_id': publicationId}).remove(err => {
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
	savePublication,
	getPublications,
	getPublicationsUser,
	getPublication,
	deletePublication,
	uploadImage,
	getImageFile
}