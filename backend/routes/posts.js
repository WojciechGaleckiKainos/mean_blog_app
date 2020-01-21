const express = require('express');

const router = express.Router();

const Post = require('../models/post');

// add new post
router.post('', (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  console.log('Received add post request:');
  console.log(post);
  post.save().then(createdPost => {
    res.status(201).json({
      postId: createdPost._id
    });
  });
});

// get all posts
router.get('', (req, res, next) => {
  console.log('Fetching posts from database...');
  Post.find()
    .then(documents => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: documents
      });
    });
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
router.put('/:id', (req, res, next) => {
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content
  });
  console.log('Received update post request:');
  console.log(req.body.id);
  console.log(post);
  Post.updateOne({_id: req.params.id}, post)
    .then(result => {
      console.log(result);
      res.status(200).json();
    })
});

// delete post by id
router.delete('/:id', (req, res, next) => {
  console.log('Received delete request for post with id: ');
  console.log(req.params.id);
  Post.deleteOne({_id: req.params.id})
    .then(result => {
      console.log(result);
      res.status(200).json();
    });
});

module.exports = router;
