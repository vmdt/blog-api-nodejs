const express = require('express');

const postController = require('../controllers/postController');
const isLogin = require('../middlewares/isLogin');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router
 .route('/:id')
 .get(postController.getPostById);

router.use(isLogin);

router.patch('/like/:id', postController.likePost);

router.post('/',
    postController.uploadImages, 
    postController.createPost);

router
 .route('/:id')
 .patch(postController.uploadImages, 
        postController.updatePost)
 .delete(postController.deletePost);
    
router.use(restrictTo('admin'));

router
 .route('/')
 .get(postController.getAllPosts)


module.exports = router;
