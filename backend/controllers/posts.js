const Post = require('../models/post');

exports.addPost = (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: extractedImagePathFromRequest(req),
    owner: req.userData.userId
  });
  console.log('Received add post request:');
  console.log(post);
  post.save()
    .then(createdPost => {
      res.status(201).json({
        postId: createdPost._id,
        imagePath: createdPost.imagePath
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Creating new post failed!'
      });
    });
};

exports.getAllPosts = (req, res, next) => {
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
    .catch(error => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      });
    });
};

exports.getPostById = (req, res, next) => {
  console.log('Received get single post request');
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({message: 'Post not found!'});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching post failed!'
      });
    });
};

exports.updatePostById = (req, res, next) => {
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
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't update a post!"
      })
    });
};

exports.deletePostById = (req, res, next) => {
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
    })
    .catch(error => {
      res.status(500).json({
        message: 'Deleting post failed!'
      })
    });
};

function extractedImagePathFromRequest(req) {
  const url = req.protocol + '://' + req.get('host');
  return url + '/images/' + req.file.filename;
}
