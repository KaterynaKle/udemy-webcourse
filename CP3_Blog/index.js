import express from "express";
import bodyParser from "body-parser";


const app = express();
const port = 3000;
const postedQuote = [
        {
          authorName : "Mahatma Gandhi",
          citation : "Live as if you were to die tomorrow. Learn as if you were to live forever.",
          tagWords : "carpe-diem, education, inspirational, learning",
          postedName : "K.E." 
        },
        {
          authorName : "J.K. Rowling",
          citation : "If you want to know what a man's like, take a good look at how he treats his inferiors, not his equals.",
          tagWords : "relationship, life, friendship",
          postedName : "K.E." 
        },
        {
          authorName : "Albert Einstein",
          citation : "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
          tagWords : "human-nature, humor, infinity, stupidity, universe",
          postedName : "K.E." 
        }
];



app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
res.render("index.ejs", { postedQuote });
});

app.get("/new_post", (req, res) => {
  res.render("input-post.ejs", { postedQuote });
  });

app.get("/posts", (req, res) => {
res.render("view-post.ejs", { postedQuote });
});


app.post("/add_post", (req, res) => {
    const author_name = req.body.author;
    const citation_text = req.body.quote;
    const tag_words = req.body.tags;
    const posted_by = req.body.postedBy;

    const newPostedQuote = { 
        authorName : author_name,
        citation : citation_text,
        tagWords : tag_words,
        postedName : posted_by 
    };
    postedQuote.push(newPostedQuote);
    //console.log(postedQuote);
    //console.log(postedQuote.length);
    res.redirect("/posts");
   
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
  });
  
    app.get("/begin", (req, res) => {
    res.redirect("/new_post");
  });

app.post("/edit", (req, res) => {
    const _index_number = req.body["edit_post"];
    res.render("edit-post.ejs", { postedQuote, _index_number });
  });

  app.post("/delete", (req, res) => {
    const _index_number = req.body["delete_post"];
    //console.log(_index_number); 
    postedQuote.splice(_index_number, 1);
    res.render("view-post.ejs", { postedQuote });
  });




app.post("/edit/:id", (req, res) => {
    const _number = parseInt(req.params.id);
    //console.log(req.params.id);
    const edit_author_name = req.body.author;
    const edit_citation_text = req.body.quote;
    const edit_tags_words = req.body.tags;
    const edit_posted_by = req.body.postedBy;

    postedQuote.splice(_number, 1, 
      { 
        authorName : edit_author_name,
        citation : edit_citation_text,
        tagWords : edit_tags_words,
        postedName : edit_posted_by
      }
      );
res.redirect("/posts");
});


app.listen(port, () => {
console.log(`I'm listening port ${port}.`);
});