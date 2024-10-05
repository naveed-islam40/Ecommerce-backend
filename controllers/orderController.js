const productsModel = require("../models/productModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Order = require("../models/orderModels");

//create New Order
const createNewOrder = asyncHandler(async function (req, res, next) {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    texPrice,
    shippingPrice,
    totalPrice,
    paidAt,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    texPrice,
    shippingPrice,
    totalPrice,
    paidAt,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order: order,
  });
});

// get Single Order
const getSingleOrder = asyncHandler(async function (req, res, next) {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("order not found with this id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get all order for logged in user
const getOrderForLoggedUser = asyncHandler(async function (req, res, next) {
  console.log(req.user._id)
  const orders = await Order.find({ user: req.user._id });

  console.log(orders);

  res.status(200).json({
    success: true,
    orders,
  });
});

//get all orders Detail --Admin
const getAllOrders = asyncHandler(async (req, res, next) => {
  const user = req.user._id;


  const adminProducts = await productsModel.find({ user });

  const adminProductIds = adminProducts.map((product) =>
    product._id.toString()
  );

  console.log(adminProductIds)
  const orders = await Order.find({
    orderItems: {
      $elemMatch: { id: { $in: adminProductIds } },
    },
  });

  console.log(orders)

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update order status
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("order not found with this id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("product already shipped", 400));
  }

  order.orderItems.forEach(async (order) => {
    await updateStock(order.id, order.quantity);
  });

  order.orderStatus = req.body.status;

  console.log(req.body.status);

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await productsModel.findById(id);

  console.log(quantity);

  product.stock -= quantity;

  console.log(product.stock);
  await product.save({ validateBeforeSave: false });
}

//delete order
const deleteOrder = asyncHandler(async function (req, res, next) {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new ErrorHandler("order not found with this id", 404));
  }

  res.status(200).json({
    success: true,
    delete: "Order delete successfully",
  });
});

module.exports = {
  createNewOrder,
  getSingleOrder,
  getOrderForLoggedUser,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
