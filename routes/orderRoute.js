const express = require("express");
const router = express.Router();
const { isAuthenticated, authorizationRole } = require("../middleware/auth");
const {
  createNewOrder,
  getOrderForLoggedUser,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

router.route("/create/new").post(isAuthenticated, createNewOrder);
router.route("/order/:id").get(isAuthenticated, getSingleOrder);
router.route("/order/user").post(isAuthenticated, getOrderForLoggedUser);
router
  .route("/order/All")
  .post(isAuthenticated, authorizationRole("admin"), getAllOrders);
router
  .route("/order/update/:id")
  .put(isAuthenticated, authorizationRole("admin"), updateOrderStatus);
router
  .route("/order/delete/:id")
  .delete(isAuthenticated, authorizationRole("admin"), deleteOrder);

module.exports = router;
