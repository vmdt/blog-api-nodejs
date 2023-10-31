const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const isLogin = require('../middlewares/isLogin');
const restrictTo = require('../middlewares/restrictTo');
const express = require('express');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', isLogin, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.get('/refesh-access-token', authController.validateRefeshToken, authController.refeshAccessToken);
router.post('/get-otp', authController.sendVerifyMail);
router.post('/verify', authController.verifyUser);

router.get('/search', userController.search);

router
 .route('/:id')
 .get(userController.getUserById);

router.use(isLogin);

router.patch('/update-me', userController.uploadProfilePhoto, userController.updateMe);
router.patch('/follow', userController.followUser);
router.patch('/unfollow', userController.unFollowUser);
router
 .route('/profile-photo')
 .delete(userController.deleteUserPhoto)
 .post(userController.uploadProfilePhoto, userController.uploadUserPhoto)
 .patch(userController.uploadProfilePhoto, userController.updateUserPhoto);


router.use(restrictTo('admin'));

router.patch('/ban', userController.actionUser);

router.delete('/:id', userController.deleteUser);

router
 .route('/')
 .get(userController.getAllUsers)
 .post(userController.createUser)


module.exports = router;
