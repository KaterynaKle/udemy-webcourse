import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://riddles-api.vercel.app";

app.use(express.static("public"));

app.get("/", async (req, res) => {
    try {
        const result = await axios.get(API_URL + "/random");
        res.render("index.ejs", { riddle: result.data.riddle,
            answer: result.data.answer
        });
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.status(404).send(error.message);
    }

});
app.get("/next", (req, res) => {
    res.redirect("/");
    });
app.get("/about", (req, res) => {
res.render("about.ejs");
});
app.listen(port, () => {
console.log(`I'm listening ${port}.`)
});