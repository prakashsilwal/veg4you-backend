const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(morgan("tiny"));
//getting database
const db = require("./Database/database.js");

//routers
const buyerRoute = require("./Routes/buyerRoute");
const sellerRoute = require("./Routes/sellerRoute");
const productRoute = require("./Routes/productRoute");
const categoryRoute = require("./Routes/categoryRoute");
const uploadRoute = require("./middleware/uploads");

//app.use
app.use(cors());
app.use(buyerRoute);
app.use(sellerRoute);
app.use(productRoute);
app.use(categoryRoute);
app.use("/upload", uploadRoute);

//listen
const PORT = process.env.PORT || 8080;
var server = app.listen(PORT, () => {
  console.log(`App is running at: localhost ${PORT}`);
});

module.exports = server;
