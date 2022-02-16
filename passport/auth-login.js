const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

const User = require("../models/paciente");

passport.use(
  "local-login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      const user = await User.findOne({ email: email });

      if (!user) {
        return done(null, false, { message: "Incorrect username.", code: 1 });
      }
      if (!user.comparePassword(password, user.password)) {
        return done(null, false, { message: "Incorrect password.", code: 2 });
      }
      return done(null, user, { message: "Correct login.", code: 200 });
    }
  )
);

passport.use(
  "local-signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      const exits = await User.exists({ email: email });

      if (exits) {
        return done(null, false, {
          message: "Email en uso.",
          code: 1,
        });
      } else {
        try {
          const user = new User({
            email: req.body.email,
            password: req.body.password,
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            genero: req.body.genero,
            dni: req.body.dni,
            avatar: req.body.avatar,
            mascotas: [],
            incorporacion: req.body.incorporacion,
          });
          user.password = user.encryptPassword(password);
          await user.save();
          return done(null, { message: "Registro exitoso.", code: 200 });
        } catch (error) {
          return done(null, false, {
            message: "Error al registrar.",
            code: 500,
          });
        }
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
