const Post = require('../models/post');

exports.createPost = (request, response, next)=>{
  const serverURL = request.protocol+ "://" + request.get("host");
  const post = new Post({
    title: request.body.title,
    content: request.body.content,
    imagePath: serverURL + "/images/" + request.file.filename,
    creator: request.userData.userID
  });
  post.save().then(createdPost=>{
    response.status(201).json({
      message: "Post added successfully to database",
      post:{
        ...createdPost,
        id: createdPost._id,
      }
    });
  }).catch(error=>{
    response.status(500).json({
      message:"Post creation failed"
    });
  });
}

exports.getPosts = (request, response, next)=>{
  const pageSize = +request.query.pageSize;
  const currPage = +request.query.currPage;
  const postQuery = Post.find();
  let fetchedPost;
  if (pageSize && currPage){
    postQuery.skip(pageSize*(currPage-1))
             .limit(pageSize);
  }
  postQuery.then(documents =>{
    fetchedPost=documents;
    return Post.countDocuments();
  })
  .then(count =>{
    response.status(200).json({
      message: "Post fetched successfully",
      posts: fetchedPost,
      totalPosts:count
    });
  }).catch(error=>{
    response.status(500).json({
      message:" Fetching post failed"
    });
  });
}

exports.getPost = (req,res,next)=>{
  Post.findById(req.params.id).then(post=>{
    if (post){
      res.status(200).json(post);
    }else{
      res.status(404).json({message:"Post not found!"});
    }
  }).catch(error=>{
    response.status(500).json({
      message:" Fetching post failed"
    });
  });
}

exports.updatePost = (req, res, next)=>{
  let imagePath = req.body.imagePath;
  if (req.file){
    const serverURL = req.protocol+ "://" + req.get("host");
    imagePath = serverURL + "/images/" + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title:req.body.title,
    content: req.body.content,
    imagePath:imagePath,
    creator: req.userData.userID
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userID},post).then(result=>{
    if (result.n >0){
      res.status(200).json({message: "Successful updated post"});
    }else{
      res.status(401).json({message: "Not Authorized to perform action"});
    }
  }).catch(error=>{
    res.status(500).json({
      message: "Error connect to database, could not update post"
    });
  });
}

exports.deletePost = (request, response, next)=>{
  Post.deleteOne({_id: request.params.id, creator: request.userData.userID}).then(result=>{
    if (result.n >0){
      response.status(200).json({message: "Post deleted"});
    }else{
      response.status(401).json({message: "Not Authorized to perform action"});
    }
  }).catch(error=>{
    response.status(500).json({
      message:" Fetching post failed"
    });
  });
}
