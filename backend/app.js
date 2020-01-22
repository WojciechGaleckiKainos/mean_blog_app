const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postRoutes = require('./routes/posts');
const path = require('path');

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

// allow access to the /images
app.use('/images', express.static(path.join('backend/images')));

// enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type', 'Accept');
  res.setHeader('Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

app.use('/api/posts', postRoutes);

module.exports = app;
