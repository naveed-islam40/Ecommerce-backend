const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"]
    },
    description: {
        type: String,
        required: [true, "Please enter product description"]
    },
    price: {
        type: Number,
        required: [true, "Please enter product price"],
        maxLength: [8, "price should pe less than 8 characters"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    catagory: {
        type: String,
        required: [true, "Please enter catagory"]
    },
    stock: {
        type: Number,
        default: 0,
        maxLength: [4, "stock should pe less than 4 characters"]
    },
    NumberofReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "usercollections"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const productsModel = mongoose.model("productCollection", productSchema);

module.exports = productsModel;