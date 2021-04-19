var express = require("express");
var router = express.Router();
const Book = require("../models").Book;

//Error handler for all get and post request
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  };
}

/* GET's home page. */
router.get("/", function (req, res, next) {
  res.redirect("/books");
});

/*GET's the full list of books */
router.get(
  "/books",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll({ order: [["createdAt", "DESC"]] });
    res.render("books", { title: "Books", books });
  })
);

/*Creates a new book form. */
router.get(
  "/books/new",
  asyncHandler(async (req, res) => {
    res.render("books/new-book", { book: {}, title: "New Book" });
  })
);

/* POST a the new books. */
router.post(
  "/books/new",
  asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("books/new-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error;
      }
    }
  })
);

/* Edit book form. */
router.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/update-book", { book, title: book.title });
    } else {
      let error = new Error();
      error.status = 404;
      // err.message = 'looks like the page you requested does not exist'
      throw error;
    }
  })
);

/* POST's new book edit. */
router.post(
  "/books/:id",
  asyncHandler(async (req, res, next) => {
    let article;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/");
      } else {
        next(error);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id; // make sure correct article gets updated
        res.render("books/update-book", {
          article,
          errors: error.errors,
          title: "Update Book",
        });
      } else {
        throw error;
      }
    }
  })
);

/* Deletes individual book. */
router.post(
  "/books/:id/delete",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/");
    } else {
      next(error);
    }
  })
);

//An intentional error to force 404 error
router.get("/500", (req, res) => {
  res.render("/500");
});
module.exports = router;
