const express = require('express');

const bookmarkController = require('../controllers/bookmarkController');
const isLogin = require('../middlewares/isLogin');
const router = express.Router();

router.use(isLogin);

router
 .route('/:id')
 .get(bookmarkController.getBookmark)
 .post(bookmarkController.saveToBookmark)
 .patch(bookmarkController.removePostFromBookmark)
 .delete(bookmarkController.deleteBookmarkByUser);

router
 .route('/')
 .get(bookmarkController.getBookmarks)
 .post(bookmarkController.createBookmark);

module.exports = router;
