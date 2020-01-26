const express = require('express');
const multer = require('multer');

const router = express.Router();

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

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

function extractedImagePathFromRequest(req) {
  const url = req.protocol + '://' + req.get('host');
  return url + '/images/' + req.file.filename;
}

// add new post
router.post(
  '',
  checkAuth,
  multer({storage: fileStorage}).single('image'),
  (req, res, next) => {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: extractedImagePathFromRequest(req),
      owner: req.userData.userId
    });
    console.log('Received add post request:');
    console.log(post);
    post.save().then(createdPost => {
      res.status(201).json({
        postId: createdPost._id,
        imagePath: createdPost.imagePath
      });
    });
  });

// get all posts
router.get('', (req, res, next) => {
  console.log('Fetching posts from database...');
  const pageSize = +req.query.pageSize; // + converts string data from request to int!
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: fetchedPosts,
        totalPosts: count
      });
    })
});

// get post by id
router.get('/:id', (req, res, next) => {
  console.log('Received get single post request');
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({message: 'Post not found!'});
      }
    })
});

// update post by id
router.put(
  '/:id',
  checkAuth,
  multer({storage: fileStorage}).single('image'),
  (req, res, next) => {
    console.log('Received update post request:');
    console.log(req.body.id);
    let imagePath = req.body.imagePath;

    if (req.file) {
      console.log('Update request contains new file');
      imagePath = extractedImagePathFromRequest(req);
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      owner: req.userData.userId
    });
    Post.updateOne({_id: req.params.id, owner: req.userData.userId}, post)
      .then(result => {
        console.log(result);
        if (result.nModified > 0) {
          res.status(200).json();
        } else {
          res.status(401).json();
        }
      });
  });

// delete post by id
router.delete(
  '/:id',
  checkAuth,
  (req, res, next) => {
    console.log('Received delete request for post with id: ');
    console.log(req.params.id);
    Post.deleteOne({_id: req.params.id, owner: req.userData.userId})
      .then(result => {
        console.log(result);
        if (result.n > 0) {
          res.status(200).json();
        } else {
          res.status(401).json();
        }
      });
  });

module.exports = router;
