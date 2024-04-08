import express, { request } from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org";

const db = new pg.Client({
user: "postgres",
host: "localhost",
database: "booknotes",
password: "dev_2023_KsK",
port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(bodyParser.json());

/*let booknotes = [
    { id: 1, title: "The Selfish Gene", author: "by Richard Dawkins", date: "Posted on 18 March, 2024", rating: "8/10", notes: "Intelligent life on a planet comes of age when it first works out the reason for its own existence." },
    { id: 2, title: "A Briefer History of Time", author: "by Stephen Hawking and Leonard Mlodinow", date: "Posted on 18 March, 2024", rating: "9/10", notes: "One hundred thousand years ago, at least six different species of humans inhabited Earth. Yet today there is only one—homo sapiens. What happened to the others? And what may happen to us?" },
    { id: 3, title: "Sapiens: A Brief History of Humankind", author: "by Yuval Noah Harari", date: "Posted on 18 March, 2024", rating: "9/10", notes: "This is the origin of and the reason for A Briefer History of Time: its author's wish to make its content accessible to readers — as well as to bring it up-to-date with the latest scientific observations and findings." },
];*/
let booknotes;
let currentUser;
let currentUserName;
let currentUserId;
const currentDate = new Date();

async function getBooknotes() {
    const result = await db.query("SELECT * FROM booknotes WHERE user_id = $1", [currentUserId]);
    booknotes = result.rows;  
    return booknotes;
}

app.get("/", (req, res) => {
res.render("index.ejs");
});

app.get("/enter", (req, res) => {
     res.render("login.ejs");
});

app.get("/register", (req, res) => {
res.render("signup.ejs");
});

app.post("/login", async (req, res) => {
    const user_name = req.body.username;
    const psw = req.body.password;
    try { 
        const result = await db.query("SELECT id, username, password FROM users");
        const users = result.rows;
        currentUser = users.find((user) => user.username === user_name && user.password === psw);

        if(currentUser){
            currentUserName = currentUser.username;
            currentUserId = currentUser.id;
            //console.log(currentUserName);
            //console.log(currentUserId);
            res.redirect("/user");
        } else {
            res.render("login.ejs", {
                username: "Incorrect username!",
                password: "Incorrect password!"
            });
        }
        } catch (err) {
            console.log(err);
        }
});

app.post("/signup", async (req, res) => {
    const user_name = req.body.username;
    const psw = req.body.password;
    const rep_psw = req.body.psw_repeat;
    if (psw != rep_psw) {
        res.render("signup.ejs", {
            psw: "Passwords do not match!"
        });
    } else {
        try {
            await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [user_name, psw]);
            res.redirect("/enter"); 
        } catch (err) {
            console.log(err);
        }   
    }
    });   


app.get("/user", async (req, res) => {
    const booknotes = await getBooknotes();
    res.render("usernotes.ejs", {
    userName: currentUserName,  
    booknote: booknotes
}); 
});

app.get("/create", (req, res) => {
    //console.log(currentUserName);
    //console.log(currentUserId);
res.render("newnote.ejs", {
    userName: currentUserName,
    time: currentDate.toDateString().slice(3,15)
});
});


app.post("/add", async(req, res) => {
    const user_id = parseInt(currentUserId);
    const title = req.body.title;
    const author = req.body.author;
    const isbn = req.body.isbn;
    const post_date = currentDate.toDateString().slice(3,15);
    const rating = req.body.rating;
    const booknote = req.body.notes;
    let cover;
//const response = await axios.get(`${API_URL}/b/${key}/${value}-${size}.jpg`, {responseType: 'arraybuffer'});
//const buffer = Buffer.from(response.data, 'binary').toString('base64');
await axios
  .get(`${API_URL}/b/isbn/${isbn}-L.jpg`, {
    responseType: 'arraybuffer'
  })
  .then(response => {
    cover = Buffer.from(response.data, 'binary').toString('base64');
  })
  .catch(ex => {
    console.error(ex);
  });
    try {
        await db.query("INSERT INTO booknotes (user_id, title, author, isbn, post_date, rating, booknote, cover) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", 
    [user_id, title, author, isbn, post_date, rating, booknote, cover]);
    res.redirect("/user");
    } catch (err) {
        console.log(err);
    }
});

app.get("/booknote/:id", async (req, res) => {
    const booknoteID = parseInt(req.params.id);
    //console.log(typeof(booknoteID));
try {
const result = await db.query("SELECT * FROM booknotes WHERE id = $1 AND user_id = $2", [booknoteID, currentUserId]);
booknotes = result.rows;
//console.log(booknotes);
res.render("booknote.ejs", {
    booknote: booknotes, 
    userName: currentUserName
});
} catch (err) {
    console.log(err);
}
});


app.get("/edit/booknote/:id", async (req, res) => {
    const booknoteID = parseInt(req.params.id);
    //console.log(typeof(booknoteID));
try {
const result = await db.query("SELECT * FROM booknotes WHERE id = $1 AND user_id = $2", [booknoteID, currentUserId]);
booknotes = result.rows;
//console.log(booknotes);
    res.render("editnote.ejs", {
    booknote: booknotes, 
    userName: currentUserName
});


} catch (err) {
    console.log(err);
}
});

app.post("/update/booknote/:id", async (req, res) => {
const booknoteID = parseInt(req.params.id);
//console.log(booknoteID);
const ed_booknote = {
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    time: currentDate.toDateString().slice(3,15),
    rating: req.body.rating,
    notes: req.body.notes,
};
//console.log(ed_booknote);
try {
await db.query("UPDATE booknotes SET title = $1, author = $2, isbn = $3, post_date = $4, rating = $5, booknote = $6 WHERE id = $7 AND user_id = $8", [
    ed_booknote.title, ed_booknote.author, ed_booknote.isbn, ed_booknote.time, ed_booknote.rating, ed_booknote.notes, booknoteID, currentUserId]);
    res.redirect("/user");
} catch (err) {
    console.log(err);
}
});

app.post("/delete/booknote/:id", async (req, res) => {
    const booknoteID = parseInt(req.params.id);
    //console.log(booknoteID);
   try {
        await db.query("DELETE FROM booknotes WHERE id = $1 AND user_id = $2", [booknoteID, currentUserId]);
        res.redirect("/user");
   } catch (err) {
    console.log(err);
   }
    
    });

    app.get("/account/delete", async (req, res) => {
        const booknotes = await getBooknotes();
        const mes_warning = "are you sure you want to delete your account? All your notes will also be deleted.";
       res.render("usernotes.ejs", {
        userID: currentUserId,
        userName: currentUserName,  
        booknote: booknotes,
        message: mes_warning
       })
    });

    app.post("/delete/user/:id", async (req, res) => {
    currentUserId = parseInt(req.params.id);
        await db.query("DELETE FROM booknotes WHERE user_id = $1", [currentUserId]);
        await db.query("DELETE FROM users WHERE id = $1", [currentUserId]);
        res.redirect("/");
    });

    app.post("/sort", async (req, res) => {
        if (req.body.rating === "rating") {
            const result = await db.query("SELECT * FROM booknotes WHERE user_id = $1 ORDER BY rating DESC", [currentUserId]);
            booknotes = result.rows;  
            res.render("usernotes.ejs", {
                userName: currentUserName,  
                booknote: booknotes
            }); 
        } 
        if (req.body.title === "title") {
            const result = await db.query("SELECT * FROM booknotes WHERE user_id = $1 ORDER BY title ASC", [currentUserId]);
            booknotes = result.rows;  
            res.render("usernotes.ejs", {
                userName: currentUserName,  
                booknote: booknotes
            }); 
        } 
        if (req.body.date === "date") {
            const result = await db.query("SELECT * FROM booknotes WHERE user_id = $1 ORDER BY post_date DESC", [currentUserId]);
            booknotes = result.rows;  
            res.render("usernotes.ejs", {
                userName: currentUserName,  
                booknote: booknotes
            }); 
        } 
    
    });

    app.get("/about", (req, res) => {
        res.render("about.ejs");
    });

app.listen(port, () => {
console.log(`I'm listening to port ${port}.`);
});