const express = require('express');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');
const PostsController = require('../controllers/posts');

const router = express.Router();

router.post('', checkAuth, extractFile, PostsController.addPost);

router.get('', PostsController.getAllPosts);

router.get('/:id', PostsController.getPostById);

router.put('/:id', checkAuth, extractFile, PostsController.updatePostById);

router.delete('/:id', checkAuth, PostsController.deletePostById);

module.exports = router;
