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
app.use(express.static(__dirname + '/public'));
app.use(
  cors({
     origin: ["https://rollingvet.netlify.app","http://localhost:3000"],
     credentials: true,
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
    // cookie : {
    //   sameSite: 'none',
    //   secure: true,
    // }
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use(routesAuth);
app.use(routesInfoAdmin);
app.use(routesInfoUser);

app.route("*").get((req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
