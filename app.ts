import * as express from 'express'
import * as pug from 'pug'
import * as serverStatic from 'serve-static'

const app = express();

app
.use(serverStatic('public', {'index': ['index.html']}))
app.listen(8088);