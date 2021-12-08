const port = 3000,
    express = require("express"),
    app = express();

app.get("/ping", (req, res) => {
    res.send({"message": "pong"});
})
    .listen(port, () => {
        console.log(`API started on port ${port}`);
    });