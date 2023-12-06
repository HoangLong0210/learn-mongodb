const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");

const app = express();
app.use(express.json());

let db;
connectToDb((err) => {
  if (!err) {
    app.listen(8888, () => {
      console.log("Server running...");
    });
    db = getDb();
  }
});

app.get("/books", (req, res) => {
  let books = [];
  const page = req.query.page || 0;
  const booksPerPage = 5;
  db.collection("books")
    .find()
    .sort({ rating: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res.status(500).json({ error: "Errorrr!" });
    });
});

app.get("/books/:id", (req, res) => {
  const id = new ObjectId(req.params.id);
  if (ObjectId.isValid(id)) {
    db.collection("books")
      .findOne({ _id: id })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ error: "Could not fetch the documents" });
      });
  } else {
    res.status(500).json({ error: "Not a valid doc id" });
  }
});

app.post("/books", (req, res) => {
  const book = req.body;
  db.collection("books")
    .insertOne(book)
    .then((result) => res.status(201).json(result))
    .catch(() => {
      res.status(500).json({ error: "Not create documents" });
    });
});

app.delete("/books/:id", (req, res) => {
  const id = new ObjectId(req.params.id);
  if (ObjectId.isValid(id)) {
    db.collection("books")
      .deleteOne({ _id: id })
      .then((result) => res.status(200).json(result))
      .catch((err) => res.status(500).json({ error: "Delete error" }));
  } else res.status(500).json({ error: "id not valid" });
});

app.patch("/books/:id", (req, res) => {
  const id = new ObjectId(req.params.id);
  const book = req.body;
  if (ObjectId.isValid(id)) {
    db.collection("books")
      .updateOne({ _id: id }, { $set: book })
      .then((result) => res.status(200).json(result))
      .catch((err) => res.status(500).json({ error: "Update error" }));
  } else res.status(500).json({ error: "id not valid" });
});
