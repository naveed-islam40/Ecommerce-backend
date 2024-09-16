const productsModel = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const asyncHandler = require("../middleware/asyncHandler");
const Apifeature = require("../utils/apiFeatures");
const cloudinary = require("cloudinary").v2;

// ... other imports

const createProduct = asyncHandler(async (req, res, next) => {
  try {
    if (!req.body.images || req.body.images.length === 0) {
      throw new Error("Images are not present");
    }

    const imagesLink = [];

    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i], {
        folder: "Product_Images",
      });

      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLink;
    req.body.user = req.user.id;

    const product = await productsModel.create(req.body);

    res.status(200).json({ success: "Product created", product });
  } catch (error) {
    console.error("Error", error);
  }
});

// getAll Product

const getAllProducts = asyncHandler(async (req, res, next) => {
  const currentProducts = 9;
  const productsCount = await productsModel.countDocuments();

  const apiFeature = new Apifeature(productsModel.find(), req.query)
    .search()
    .filter()
    .pagination(currentProducts);

  let products = await apiFeature.query;

  const allProducts = await productsModel.find();

  res.status(200).json({
    success: true,
    length: products.length,
    productsCount,
    products,
    currentProducts,
    allProducts,
  });
});

//get product by id

const getSingleProduct = asyncHandler(async (req, res, next) => {
  const product = await productsModel.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({ success: true, product });
});

// AllAdminPRoducts
const getAllAdminProducts = asyncHandler(async (req, res, next) => {
  const user = req.user.id;

  try {
    const adminProducts = await productsModel.find({ user });

    res.status(200).json({
      success: true,
      adminProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error at Admin Products",
    });
  }
});

// product update
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await productsModel.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  product = await productsModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: "product update successfully" });
});

// delete product

const deleteProduct = asyncHandler(async (req, res, next) => {
  const productById = req.params.id;
  const result = await productsModel.deleteOne({ _id: productById });

  if (!result) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({ success: "product delete successfully" });
});

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllAdminProducts,
};
