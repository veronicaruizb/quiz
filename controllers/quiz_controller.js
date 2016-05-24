var models = require('../models');
var Sequelize = require('sequelize');

//autoload el quiz asociado a :quizId
exports.load = function(req, res, next, quizId){
	models.Quiz.findById(quizId).then(function(quiz){
		if(quiz){
			req.quiz = quiz;
			next();
		} else {
			next(new Error('No existe quizId=' +quizId));
		}
	}).catch(function(error){next(error);});
};


//GET /quizzes
exports.index = function(req, res, next){
	var search = req.query.search;
	if(req.params.format=='json'){
		models.Quiz.findAll().then(function(quizzes){
		res.send(JSON.stringify(quizzes));
		}).catch(function(error){next(error);});
	} else {
	if(search){
		search = search.replace(/\s/g, "%");
		models.Quiz.findAll({where:["question like ?", '%'+search+'%'], order: 'question ASC'}).then(function(quiz){
		res.render('quizzes/list.ejs', {quiz: quiz});
		}).catch(function(error){next(error);});
	} else {
	models.Quiz.findAll().then(function(quizzes){
		res.render('quizzes/index.ejs', {quizzes: quizzes, search: search});
	}).catch(function(error){next(error);});
	}
	}
};

//GET /quizzes/:id
exports.show = function(req, res, next){
	models.Quiz.findById(req.params.quizId).then(function(quiz){
		if(req.params.format=='json'){
		res.send(JSON.stringify(quiz));
		} else {
		if(quiz){
			var answer = req.query.answer || '';
			res.render('quizzes/show', {quiz: req.quiz, answer: answer});
		}
		else {
			throw new Error('No existe ese quiz en la BBDD.');
		}
	}
	}).catch(function(error){next(error);});
};

//GET /quizzes/:id/check
exports.check = function(req, res){
	models.Quiz.findById(req.params.quizId).then(function(quiz){
		if(quiz){
			var answer = req.query.answer || '';
			var result = answer === req.quiz.answer ? 'Correcta': 'Incorrecta';
			res.render('quizzes/result', {quiz: req.quiz, result: result, answer: answer});
		}
		else {
			throw new Error('No existe ese quiz en la BBDD.');
		}
	}).catch(function(error){next(error);});
};

//GET /quizzes/new
exports.new = function(req, res, next){
	var quiz = models.Quiz.build({question: "", answer: ""});
	res.render('quizzes/new', {quiz: quiz});
};

//POST /quizzes/create
exports.create = function(req, res, next){
	var quiz=models.Quiz.build({question: req.body.quiz.question,
								answer: req.body.quiz.answer});
	//guarda en DB los campos pregunta y respuesta de quiz
	quiz.save({fields: ["question", "answer"]}).then(function(quiz){
		req.flash('sucess', 'Quiz creado con éxito.');
		res.redirect('/quizzes');
	}).catch(Sequelize.ValidationError, function(error){
		req.flash('error', 'Errores en el formulario:');
		for(var i in error.errors){
			req.flash('error', error.errors[i].value);
		};
		res.render('quizzes/new', {quiz: quiz});
	}).catch(function(error){
		req.flash('error', 'Error al crear un Quiz: '+error.message);
		next(error);
	});
};
