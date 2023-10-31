const express = require('express');

const commentController = require('../controllers/commentController');
const isLogin = require('../middlewares/isLogin');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router.use(isLogin);

router.patch('/like/:id', commentController.likeComment);

router
 .route('/:id')
 .patch(commentController.updateMyComment)
 .delete(commentController.deleteMyComment);

router.post('/', commentController.createComment);

router.use(restrictTo('admin'));

router
 .route('/')
 .get(commentController.getAllComments)

module.exports = router;
