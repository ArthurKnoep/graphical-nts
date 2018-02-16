import * as express from 'express'

const app = express();

app
.get("/", (req, res) => {
    res.send("Test1");
});
app.listen(8088);