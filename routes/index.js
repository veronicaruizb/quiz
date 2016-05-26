var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads/'});
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');
var sessionController= require('../controllers/session_controller');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/author', function(req,res,next){
	res.render('author');
});

//autoload de rutas que usen :quizId
router.param('quizId', quizController.load);
router.param('userId', userController.load);
router.param('commentId', commentController.load);

//Definicion de rutas de /quizzes
router.get('/quizzes.:format?', quizController.index);
router.get('/quizzes/:quizId(\\d+).:format?', quizController.show);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);
router.get('/quizzes/new', sessionController.loginRequired, quizController.new);
router.post('/quizzes', sessionController.loginRequired, upload.single('image'), quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit', sessionController.loginRequired, quizController.ownershipRequired, quizController.edit);
router.put('/quizzes/:quizId(\\d+)', sessionController.loginRequired, quizController.ownershipRequired, upload.single('image'), quizController.update);
router.delete('/quizzes/:quizId(\\d+)', sessionController.loginRequired, quizController.ownershipRequired, quizController.destroy);

router.get('/quizzes/:quizId(\\d+)/comments/new', sessionController.loginRequired, commentController.new);
router.post('/quizzes/:quizId(\\d+)/comments', sessionController.loginRequired, commentController.create);
router.put('/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)/accept', sessionController.loginRequired, quizController.ownershipRequired, commentController.accept);

//Definición de rutas de cuenta
router.get('/users', userController.index);
router.get('/users/:userId(\\d+)', userController.show);
router.get('/users/new', userController.new);
router.post('/users', userController.create);
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.edit);
router.put('/users/:userId(\\d+)', sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.update);
router.delete('/users/:userId(\\d+)', sessionController.loginRequired, sessionController.adminAndNotMyselfRequired, userController.destroy);

//Definición de rutas de sesion
router.get('/session', sessionController.new);
router.post('/session', sessionController.create);
router.delete('/session', sessionController.destroy);


module.exports = router;
