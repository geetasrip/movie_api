// import dependencies
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

const express = require("express"),
  morgan = require("morgan"),
  path = require("path"),
  bodyParser = require("body-parser");
const app = express();
const { check, validationResult } = require("express-validator");

/*mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
});*/
mongoose.connect(
  "mongodb+srv://dbadmin:testpassword@cluster0.s66pe.mongodb.net/dbadmin?retryWrites=true retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
//mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true
//}).then(() => console.log('mongoDB connected...'));

/*mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});*/

// log requests
app.use(morgan("common"));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");

const whitelist = ["http://localhost:1234"];
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

let auth = require("./auth")(app);
const passport = require("passport");

const jwt = require("jsonwebtoken");
const jwtSecret = "your_jwt_secret"; // This has to be the same key used in the JWTStrategy

let generateJWTToken = user => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you’re encoding in the JWT
    expiresIn: "7d", // This specifies that the token will expire in 7 days
    algorithm: "HS256" // This is the algorithm used to “sign” or encode the values of the JWT
  });
};

//GET requests

app.all("/*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get("/", (req, res) => {
  res.send(
    "Hello! Welcome to myFlix where you will find information about the top 10 best suspense/thriller movies"
  );
});

//GET Documentation
app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

//GET all movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then(movies => {
      res.status(201).json(movies);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// GET movies by title
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then(movie => {
        res.json(movie);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// GET all genres
app.get(
  "/genre",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.distinct("Genre")
      .then(movies => {
        res.status(200).json(movies);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//GET a genre by Name
app.get(
  "/genre/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then(movie => {
        res.json(movie.Genre);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//GET director's info
app.get(
  "/directors",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.distinct("Director")
      .then(movies => {
        res.status(200).json(movies);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

// GET director's info by name
app.get(
  "/directors/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then(movie => {
        res.json(movie.Director);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.post(
  "/users",
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required")
      .not()
      .isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then(user => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then(user => {
              let token = generateJWTToken(user.toJSON());
              return res.json({ user, token });
            })
            .catch(error => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

//Get all users
app.get("/usersall", (req, res) => {
  console.log("in get users");
  Users.find()
    .then(users => {
      console.log("users");
      console.log(users);
      res.status(201).json(users);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Get a user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then(user => {
        res.json(user);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Update a user's info by username
app.put(
  "/users/:Username",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required")
      .not()
      .isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }, //This line makes sure the document is returned)
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error" + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//Add a movie to a user's list of favorites
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID }
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error:" + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//DELETE a movie from favorites
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      {
        Username: req.params.Username
      },
      {
        $pull: {
          FavoriteMovies: req.params.MovieID
        }
      },
      {
        new: true //This line makes sure that the updated document is returned
      },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//DELETE a user by their username
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username })
      .then(user => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("oops, something went wrong! Try again.");
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
