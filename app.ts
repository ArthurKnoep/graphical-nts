import * as express from 'express'

const app = express();

app
.get("/", (req, res) => {
    res.send("ok");
});
app.listen(8088);