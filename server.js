require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");

const app = express();
const routesAuth = require("./routes/auth");
const routesInfoAdmin = require("./routes/infoAdmin");
const routesInfoUser = require("./routes/infoUser");
require("./database/database");
require("./passport/auth-login");

//settings
app.set("port", process.env.PORT || 5000);

//middlewares
app.use(
  cors({
    origin: "https://rollingvet.netlify.app",
    //origin: "*",
    credentials: true,
    allowedHeaders: true,
    methods: "GET,PUT,POST,DELETE,OPTIONS",
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routes
app.all('*', function(req, res, next){
  res.set('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);     
  if ('OPTIONS' == req.method) return res.send(204);
  next();
});
app.use(routesAuth);
app.use(routesInfoAdmin);
app.use(routesInfoUser);

app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
