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
    'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.post('/api/posts', (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  console.log('Received add post request:')
  console.log(post);
  post.save().then(createdPost => {
    res.status(201).json({
      postId: createdPost._id
    });
  });
});

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
