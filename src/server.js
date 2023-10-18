require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const notFoundMw = require("./middlewares/not-found");
const errorMw = require("./middlewares/error");
const authRoute = require("./routes/auth-route");
const userRoute = require("./routes/user-route");
const postRoute = require("./routes/post-route");
const followRoute = require("./routes/follow-route");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("./public"));

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/follow", followRoute);

app.use(notFoundMw);
app.use(errorMw);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log("Server is running on port", port));
