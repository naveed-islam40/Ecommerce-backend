const mongoose = require("mongoose");

function connectDB(url) {
    mongoose.connect(url)
        .then(() => {
            console.log(`mongodb connected successfully`);
        })
}

module.exports = {
    connectDB
}