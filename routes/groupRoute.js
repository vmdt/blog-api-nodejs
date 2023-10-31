const express = require('express');

const groupController = require('../controllers/groupController');
const isLogin = require('../middlewares/isLogin');

const router = express.Router();

router.use(isLogin);

router
 .route('/:id/messages')
 .get(groupController.getGroupMessage)
 .post(groupController.createMessage);

router
 .patch('/:id/seen', groupController.setSeenMessage);

router
 .route('/:id')
 .get(groupController.getGroupByUser)
 .patch(groupController.updateGroupByUser);


router
 .route('/')
 .get(groupController.getUserGroups)
 .post(groupController.createGroup);

module.exports = router;
