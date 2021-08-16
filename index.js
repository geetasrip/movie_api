const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  uuid = require("uuid");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let movies = [
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

//get all movies json
app.get("/movies", (req, res) => {
  res.json(movies);
});

//Get data about a single movie by title to the user
app.get("/movies/:title", (req, res) => {
  res.json(
    movies.find(movie => {
      return movie.Title === req.params.title;
    })
  );
});

//Get data about a genre (description) by name/title
app.get("/movies/genre/:title", (req, res) => {
  res.json(
    movies.find(movie => {
      return movie.genre === req.params.title;
    })
  );
});

//Get data about a director
app.get("/movies/director/:title", (req, res) => {
  res.json(
    movies.find(movie => {
      return movie.director === req.params.title;
    })
  );
});

//Register new User
app.post("/user", (req, res) => {
  let newUser = req.body;
  if (!newUser.username) {
    const message = "Missing name in request body";
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});

//Allow users to update their user info
app.put("/user/:username", (req, res) => {
  let user = users.find(user => {
    return user.username === req.params.username;
  });
  if (user) {
    user.phoneNumber = req.body.phoneNumber;
    res
      .status(201)
      .send(
        req.params.username +
          " information was successfully Updated to " +
          user.phoneNumber
      );
  } else {
    res
      .status(404)
      .send("User with the name " + req.params.username + " was not found.");
  }
});

//Add to favorites
app.put("/user/:username/movie/:movieID", (req, res) => {
  let user = users.find(user => {
    return user.username === req.params.username;
  });
  if (user) {
    user.favoritesMovies.push({
      movieID: req.params.movieID,
      movieName: "test"
    });
    res.status(201).send(" information was successfully added to favorites ");
  } else {
    res
      .status(404)
      .send("User with the name " + req.params.name + " was not found.");
  }
});

//Remove from Favorites
app.delete("/user/:username/movie/:movieID", (req, res) => {
  let user = users.find(user => {
    return user.username === req.params.username;
  });

  if (user) {
    user.favoritesMovies.splice(
      user.favoritesMovies.findIndex(
        item => item.movieID === req.param.movieID
      ),
      1
    );
    res
      .status(201)
      .send(
        req.params.name +
          " information was successfully deleted from favorites "
      );
  } else {
    res
      .status(404)
      .send("User with the name " + req.params.name + " was not found.");
  }
});

//Deregister  User
app.delete("/user/:username", (req, res) => {
  let user = users.find(user => {
    return user.username === req.params.username;
  });

  if (!user.username) {
    const message = "Missing name in request body";
    res.status(400).send(message);
  } else {
    users.pop(user);
    res.status(201).send(user);
  }
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
