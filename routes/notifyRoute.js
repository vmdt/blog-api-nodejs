const express = require('express');

const notifyController = require('../controllers/notifyController');
const isLogin = require('../middlewares/isLogin');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router.use(isLogin);

router.get('/', notifyController.getNotisByUserId);
router.delete('/:id', notifyController.deleteNotiByUser);

router.use(restrictTo('admin'));
router
 .route('/')
 .get(notifyController.getAllNotis)
 .patch(notifyController.updateNoti)
 .delete(notifyController.deleteNoti);

module.exports = router;
