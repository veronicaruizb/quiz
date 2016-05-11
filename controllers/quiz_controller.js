var models = require('../models');

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
			res.render('quizzes/show', {quiz: quiz, answer: answer});
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
			var result = answer === quiz.answer ? 'Correcta': 'Incorrecta';
			res.render('quizzes/result', {quiz: quiz, result: result, answer: answer});
		}
		else {
			throw new Error('No existe ese quiz en la BBDD.');
		}
	}).catch(function(error){next(error);});
};

