require("dotenv").config();

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary");
const bodyParser = require("body-parser");
const expressUpload = require("express-fileupload");
const http = require("http");
const cors = require("cors");

const products = require("./routes/products");
const users = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const { connectDB } = require("./connection");
const ErrorMiddleware = require("./middleware/error");
const payment = require("./routes/paymentRoute");
// const initialSocket = require("./controllers/socketController");

// const socketServer = http.createServer(app);

// Handling uncaught Execption
process.on("uncaughtException", (err) => {
  console.log(`Error ${err}`);
  console.log(`shutting down the server due to  uncaught Execption `);
  process.exit(1);
});

let port = process.env.PORT;
let MONGO_URL = process.env.MONGO_URL;

//dbConnetcion

connectDB(MONGO_URL);

cloudinary.config({
  cloud_name: process.env.CLOUDNARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressUpload());
app.use(cors(
  {
    origin: ["http://localhost:5173", "https://ecommerce-frontend-teal-five.vercel.app"],
    credentials: true,
  }
));

//middlewares
app.use("/api", products);
app.use("/api", users);
app.use("/api", order);
app.use("/api", payment);
app.use(ErrorMiddleware);
// initialSocket(socketServer);

const server = app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

// unhandeled promise Rejection

process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log("shutting down the server due to unhandeled promise rejection");

  server.close(() => {
    process.exit(1);
  });
});
