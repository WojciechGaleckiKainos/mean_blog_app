const express = require('express');
const multer = require('multer');

const checkAuth = require('../middleware/check-auth');
const PostsController = require('../controllers/posts');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type!');

    if (isValid) {
      error = null;
    }
    callback(error, 'backend/images') // relative path for server.js file
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post(
  '',
  checkAuth,
  multer({storage: fileStorage}).single('image'),
  PostsController.addPost
);

router.get('', PostsController.getAllPosts);

router.get('/:id', PostsController.getPostById);

router.put(
  '/:id',
  checkAuth,
  multer({storage: fileStorage}).single('image'),
  PostsController.updatePostById
);

router.delete(
  '/:id',
  checkAuth,
  PostsController.deletePostById
);

module.exports = router;
