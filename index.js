let Koa = require('./application')
let app = new Koa()

app.use((req, res) => {
    res.end('hello world')
})

app.listen(3000)