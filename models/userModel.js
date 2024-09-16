require("dotenv").config();

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: [30, "Name should be less than 30 characters"],
        minlength: [5, "Name should be more than 5 characters"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validator: [validator.isEmail, "Please enter a valid Email"],
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Please enter password more than 8 characters"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    role: {
        type: String,
        default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);

    const hash = await bcrypt.hash(this.password, salt);

    this.password = hash;
    next();
});

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRE_KEY,
    });
};

// generating matchPassword method

userSchema.methods.matchPassword = async function (enteredpassword) {
    const isMatch = await bcrypt.compare(enteredpassword, this.password);
    if (!isMatch) {
        throw new Error("Invalid username or password");
    }

    return isMatch;
};

// generating resetPassword method

userSchema.methods.getResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

const userModel = mongoose.model("userCollection", userSchema);

module.exports = userModel;
