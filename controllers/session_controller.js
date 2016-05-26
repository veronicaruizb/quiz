var models = require('../models');
var Sequelize = require('sequelize');
var url = require('url');

var authenticate = function(login, password){
	return models.User.findOne({where: {username:login}}).then(function(user){
		if(user && user.verifyPassword(password)){
			return user;
		} else {
			return null;
		}
	});
};

//GET /session --Formulario de login
exports.new = function(req, res, next){
	var redir = req.query.redir || url.parse(req.header.referer || "/").pathname;
	if(redir==='/session'){redir="/";}
	res.render('session/new', {redir:redir});
};	

//POST /session --Crear la sesion si usuario se autentica
exports.create = function (req, res, next){
	var redir = req.body.redir || '/'
	var login = req.body.login;
	var password = req.body.password;

	authenticate(login, password).then(function(user){
		if(user){
			var ta = new Date();
			var tb = ta.getTime();
			req.session.user = {id:user.id, username:user.username, isAdmin:user.isAdmin};
			res.redirect(redir);
		}else{
			req.flash('error', 'La autentificación ha fallado. Reinténtelo otra vez');
			res.redirect("/session?redir="+redir);
		}
	}).catch(function(error){
		req.flash('error', 'Se ha producido un error: '+error);
		next(error);
	});
};

//DELETE /session --Destruir sesion 
exports.destroy = function(req, res, next){
	delete req.session.user;
	res.redirect("/session");
};

//Middleware: se requiere hacer login
exports.loginRequired = function(req, res, next){
	if(req.session.user){
		next();
	} else {
		res.redirect('/session?redir=' + (req.param('redir')||req.url));
	}
};

exports.adminRequired = function(req, res, next){
	var isAdmin = req.session.user.isAdmin;
	if(isAdmin){
		next();
	} else {
		console.log('Ruta prohibida: el usuario logeado no es administrador.');
		res.send(403);
	}
};


exports.adminOrMyselfRequired = function(req, res, next){
	var isAdmin = req.session.user.isAdmin;
	var userId = req.user.id;
	var loggedUserId = req.session.user.id;

	if(isAdmin || userId === loggedUserId){
		next();
	} else {
		console.log('Ruta prohibida: no es el usuario logeado, ni un administrador.');
		res.send(403);
	}
};

exports.adminAndNotMyselfRequired = function(req, res, next){
	var isAdmin = req.session.user.isAdmin;
	var userId = req.user.id;
	var loggedUserId = req.session.user.id;
	if(isAdmin || userId === loggedUserId){
		next();
	}else{
		console.log('Ruta prohibida: no es el usuario logeado, ni un administrador.');
		res.send(403); 
	}
};