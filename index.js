const express = require("express"),
  morgan = require("morgan");

const app = express();

let movie = [
  {
    name: "avengers infinity war",
    hero: "tom holland"
  },
  {
    name: "avengers end game",
    hero: "tom holland"
  },
  {
    name: "spiderman home coming",
    hero: "tom holland"
  },
  {
    name: "spiderman far coming",
    hero: "tom holland"
  }
];

app.use(morgan("common"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.send("Welcome to my book club!");
});

app.get("/movies", (req, res) => {
  res.json(movie);
});

app.use(express.static("public"));

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
