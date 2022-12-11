const express = require("express");

const session = require("express-session");
const cookieParser = require("cookie-parser");

const userRoute = require("./api/user");
const ExpressError = require("./utils/ExpressError");

const app = express();

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

app.set("view engine", "ejs");
app.set("views", "views");

app.use(cookieParser());
app.use(session({
  secret: 'Your_key',
  resave: true,
  saveUninitialized: true,
})
);

app.use(express.urlencoded({ extended: true }));

app.use(userRoute);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something Went Wrong..." } = err;
  res.status(status).send(message);
});

app.listen(port, host, () => {
  console.log(`Listening to https://${host}:${port}/`);
});
