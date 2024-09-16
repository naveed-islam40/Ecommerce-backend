const express = require("express");
const router = express.Router();
const { isAuthenticated, authorizationRole } = require("../middleware/auth");
const {
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
} = require("../controllers/userController");

router.route("/register").post(register);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/reset").post(resetPasswordToken);
router.route("/password/reset/:token").put(changePassword);
router.route("/me").get(isAuthenticated, getuserDetails);
router.route("/me/updatepassword").put(isAuthenticated, updatePassword);
router.route("/me/updatedetails").put(isAuthenticated, updateUserDetails);
router.route("/contact/page").post(isAuthenticated, contactUsPage);

//Admin Routes
router
  .route("/admin/getallusers")
  .get(isAuthenticated, authorizationRole("admin"), getAllusers);

router
  .route("/admin/user/:id")
  .get(isAuthenticated, authorizationRole("admin"), singleUser)
  .put(isAuthenticated, authorizationRole("admin"), changeUserRole)
  .delete(isAuthenticated, authorizationRole("admin"), deleteSingleUser);

router
  .route("/review")
  .put(isAuthenticated, createReview)
  .get(getAllReviews)
  .delete(isAuthenticated, deleteReview);

module.exports = router;
