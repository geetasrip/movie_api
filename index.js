const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models.js");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let movies1 = [
  {
    Title: "avengers infinity war",
    description:
      "Iron Man, Thor, the Hulk and the rest of the Avengers unite to battle their most powerful enemy yet -- the evil Thanos. On a mission to collect all six Infinity Stones, Thanos plans to use the artifacts to inflict his twisted will on reality. The fate of the planet and existence itself has never been more uncertain as everything the Avengers have fought for has led up to this moment.",
    genre: "Superhero",
    director: "Anthony Russo",
    id: "49590800290093094903"


    
  },
  {
    Title: "The Matrix",
    description:
      "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
    genre: "tom holland",
    director: "science fiction",
    id: "9837498398093094093"
  },
  {
    Title: "Waterworld",
    description:
      'In a future where the polar ice-caps have melted and Earth is almost entirely submerged, a mutated mariner fights starvation and outlaw .."smokers," and reluctantly helps a woman and a young girl try to find dry land.',
    genre: "Adventure",
    director: "Kevin Reynolds",
    id: "609ec668182950cee2ca2392"
  }
];

let users = [
  {
    username: "geeta",
    emailID: "geeta.sri@gmail.com",
    phoneNumber: "4342342244222",
    favoritesMovies: [
      {
        movieID: "111111",
        movieName: "Waterworld"
      }
    ]
  },
  {
    username: "viyaan",
    emailID: "viyaan@gmail.com",
    phoneNumber: "9789790898808",
    favoritesMovies: [
      {
        movieID: "232323",
        movieName: "The Matrix"
      }
    ]
  }
];

app.use(morgan("common"));
const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

//get all movies json
app.get("/movies", (req, res) => {
  //res.json(movies);
  Movies.find().then(movies => res.json(movies));
});

//Get data about a single movie by title to the user
app.get("/movies/:title", async (req, res) => {
  const movie = await Movies.findOne({ Title: req.params.title });
  res.send(movie);
});

//Get data about a genre (description) by name/title
app.get("/movies/genre/:title", async (req, res) => {
  const movie = await Movies.findOne({ Title: req.params.title });
  res.send(movie.Genre);
});

//Get data about a director
app.get("/movies/director/:title", async (req, res) => {
  const movie = await Movies.findOne({ Title: req.params.title });
  res.send(movie.Director);
});

//Register new User
app.post("/user", async (req, res) => {
  let newUser = req.body;
  if (!newUser.Username) {
    const message = "Missing name in request body";
    res.status(400).send(message);
  } else {
    const newUser1 = new Users({
      Username: newUser.Username,
      Password: newUser.Password,
      Email: newUser.Email,
      Birthday: newUser.Birthday
    });
    await newUser1.save();
    res.send(newUser1);
  }
});
app.post("/users", (req, res) => {
  res.send("Successful POST request creating a new user");
});

//Allow users to update their user info
app.put("/user/:username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Add a movie to a user's list of favorites
app.post("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    {
      Username: req.params.Username
    },
    {
      $push: { FavoriteMovies: req.params.MovieID }
    },
    {
      new: true
    },
    // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Remove from Favorites
app.delete("/users/:username/movies/:movieID", (req, res) => {
  Users.findOneAndUpdate(
    {
      _id: "61197d9cd5a76774f298690d"
    },
    {
      $pull: { FavoriteMovies: "60c6f147e3b43ae28bea285d" }
    },
    {
      new: true
    },
    // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Delete a user by username
app.delete("/users/:Username", (req, res) => {
  console.log(req.params.Username);
  Users.findOneAndRemove({ Username: req.params.Username })
    .then(user => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.use((err, req, res, next) => {
  console.log(err);
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.use(express.static("public"));

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
