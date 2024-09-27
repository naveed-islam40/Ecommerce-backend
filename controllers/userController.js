const express = require("express");
const http = require("http");

const ErrorHandler = require("../utils/ErrorHandler");
const asyncHandler = require("../middleware/asyncHandler");
const userModel = require("../models/userModel");
const { sendMail, contactUsMail } = require("../utils/sendMail");
const crypto = require("crypto");
const productsModel = require("../models/productModel");
const cloudinary = require("cloudinary");
const sendToken = require("../utils/jwtToken");
// const socketIo = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// register user
const register = asyncHandler(async function (req, res, next) {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });
  const { name, email, password } = req.body;
  const user = await userModel.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res);
});

// Login user
const loginUser = asyncHandler(async function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("please enter email or password", 400));
  }

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 404));
  }

  const comparePassword = await user.matchPassword(password);
  if (!comparePassword) {
    return next(new ErrorHandler("Invalid email or password", 404));
  }

  sendToken(user, 200, res);
});

//  logout user
const logout = asyncHandler(async function (req, res, next) {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User Logout",
  });
});

// reset Token
const resetPasswordToken = asyncHandler(async function (req, res, next) {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  const resetToken = user.getResetToken();

  await user.save({ validateBeforeSave: false });

  const resestPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `your password reset token is :- \n\n ${resestPasswordUrl} \n\n if you not request this email please ignore it`;

  try {
    await sendMail({
      email: user.email,
      subject: "Naveed E-commerce website",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} please check your email`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// change password
const changePassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmpassword) {
    return next(new ErrorHandler("password not matched", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//  get user
const getuserDetails = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update password
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user.id).select("+password");

  const comparePassword = await user.matchPassword(req.body.oldpassword);
  if (!comparePassword) {
    return next(new ErrorHandler("old password is incorrect", 400));
  }

  if (req.body.newpassword !== req.body.confirmpassword) {
    return next(new ErrorHandler("confirm password does not match", 400));
  }

  user.password = req.body.newpassword;
  await user.save();
  sendToken(user, 200, res);
});

// update user Details
const updateUserDetails = asyncHandler(async (req, res, next) => {
  const updateData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar) {
    const user = await userModel.findById(req.user.id);

    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    updateData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await userModel.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, user });
});

// get all user --Admin
const getAllusers = asyncHandler(async function (req, res, next) {
  const users = await userModel.find();

  res.status(200).json({
    success: true,
    length: users.length,
    users,
  });
});

// getsingleUser --Admin
const singleUser = asyncHandler(async function (req, res, next) {
  const user = await userModel.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with this ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// change user role --Admin
const changeUserRole = asyncHandler(async function (req, res, next) {
  const updateData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await userModel.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, user });
});

const contactUsPage = asyncHandler(async (req, res, next) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Email and message are required" });
    }

    await contactUsMail({
      email,
      subject: "Conatct Us Mail",
      message: `From: ${email}\n\n${message}`,
    });

    console.log(email);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// delete single
const deleteSingleUser = asyncHandler(async function (req, res, next) {
  const user = await userModel.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `user delete successfully`,
    user,
  });
});

// create new review or update the review
const createReview = asyncHandler(async function (req, res, next) {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await productsModel.findById(productId);

  if (!product) {
    return next(
      new ErrorHandler(`product does not exist with this ${productId}`)
    );
  }

  const isreviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isreviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.NumberofReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});

// get all reviews of a product
const getAllReviews = asyncHandler(async function (req, res, next) {
  const product = await productsModel.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler(`product not found`, 404));
  }

  res.status(200).json({
    success: true,
    total_reviews: product.reviews.length,
    reviews: product.reviews,
  });
});

// delete review
const deleteReview = asyncHandler(async function (req, res, next) {
  const product = await productsModel.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler(`product not found`, 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const ratings = avg / reviews.length;
  const numOfReviews = reviews.length;

  await productsModel.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    total_reviews: reviews.length,
    reviews: reviews,
  });
});

module.exports = {
  register,
  loginUser,
  logout,
  resetPasswordToken,
  changePassword,
  getuserDetails,
  updatePassword,
  updateUserDetails,
  getAllusers,
  singleUser,
  changeUserRole,
  deleteSingleUser,
  createReview,
  getAllReviews,
  deleteReview,
  contactUsPage,
};
