const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  getAllAdminProducts,
} = require("../controllers/products");
const { isAuthenticated, authorizationRole } = require("../middleware/auth");

router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getSingleProduct);
router
  .route("/products/admin")
  .get(isAuthenticated, authorizationRole("admin"), getAllAdminProducts);
router
  .route("/admin/createProduct")
  .post(isAuthenticated, authorizationRole("admin"), createProduct);
router
  .route("/admin/updateProduct/:id")
  .patch(isAuthenticated, authorizationRole("admin"), updateProduct);
router
  .route("/admin/deleteProduct/:id")
  .delete(isAuthenticated, authorizationRole("admin"), deleteProduct);

module.exports = router;
