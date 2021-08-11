const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (req, res, next)=>{
  bcrypt.hash(req.body.password, 10).then(resultHash=>{
    const user = new User({
      email: req.body.email,
      password: resultHash
    });
    user.save()
    .then(result=>{
      res.status(201).json({
        message: "Successfully registered"
      });
    })
    .catch(error=>{
      res.status(500).json({
        message: "Invalid authentication credentials!"
      });
    });
  });
}

exports.userLogin = (req, res,next)=>{
  let fetchedUser;
  User.findOne({ email: req.body.email}).then(user=>{
    if (!user){
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      });
    }
    fetchedUser = user;
    return bcrypt.compare(req.body.password, user.password)
  })
  .then(result=>{
    if(!result){
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      });
    }
    const token = jwt.sign({email:fetchedUser.email, userID: fetchedUser._id},process.env.JWT_SECRTE, {expiresIn: "1h"});
    res.status(200).json({
      token:token,
      expiresIn: 3600,
      userID: fetchedUser._id
    });
  })
  .catch(error=>{
    return res.status(401).json({
      message: "Invalid authentication credentials!",
    });
  });
}
