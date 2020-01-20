const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Post = require('./models/post');

const app = express();

mongoose.connect('mongodb+srv://wojtek_user:IA1UtuP3hFkfRO84@cluster0-ycrgo.mongodb.net/post-db?retryWrites=true&w=majority')
  .then(() => {
    console.log('Successfully connected to database!')
  })
  .catch(() => {
    console.log('Connection to database failed!')
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type', 'Accept');
  res.setHeader('Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

// add new post
app.post('/api/posts', (req, res, next) => {
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
app.get('/api/posts', (req, res, next) => {
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
app.get('/api/posts/:id', (req, res, next) => {
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
app.put('/api/posts/:id', (req, res, next) => {
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
app.delete('/api/posts/:id', (req, res, next) => {
  console.log('Received delete request for post with id: ');
  console.log(req.params.id);
  Post.deleteOne({_id: req.params.id})
    .then(result => {
      console.log(result);
      res.status(200).json();
    });
});

module.exports = app;
