let http = require('http')
let EventEmitter = require('events')
let Stream = require('stream')
let context = require('./context')
let request = require('./request')
let response = require('./response')

class Koa extends EventEmitter {
    constructor() {
        super()
        // this.fn
        this.middlewares = []
        this.context = context
        this.request = request
        this.response = response
    }

    use(fn) {
        // this.fn = fn
        this.middlewares.push(fn)
    }

    createContext(req, res) {
        const ctx = Object.create(this.context)
        const request = ctx.request = Object.create(this.request)
        const response = ctx.response = Object.create(this.response)
        ctx.req = request.req = response.req = req
        ctx.res = request.res = response.res = res
        request.ctx = response.ctx = ctx
        request.response = response
        response.request = request
        return ctx
    }

    compose(middlewares, ctx) {
        function dispatch(index) {
            if (index === middlewares.length) return Promise.resolve() // 若最后一个中间件，返回一个resolve的promise
            let middleware = middlewares[index]
            return Promise.resolve(middleware(ctx, () => dispatch(index + 1))) // 用Promise.resolve把中间件包起来
        }
        return dispatch(0)
    }
    
    handleRequest(req, res) {
        res.statusCode = 404
        let ctx = this.createContext(req, res)
        let fn = this.compose(this.middlewares, ctx)
        fn.then(() => { // then了之后再进行判断
            if (typeof ctx.body == 'object') {
                res.setHeader('Content-Type', 'application/json;charset=utf8')
                res.end(JSON.stringify(ctx.body))
            } else if (ctx.body instanceof Stream) {
                ctx.body.pipe(res)
            }
            else if (typeof ctx.body === 'string' || Buffer.isBuffer(ctx.body)) {
                res.setHeader('Content-Type', 'text/htmlcharset=utf8')
                res.end(ctx.body)
            } else {
                res.end('Not found')
            }
        }).catch(err => { // 监控错误发射error，用于app.on('error', (err) =>{})
            this.emit('error', err)
            res.statusCode = 500
            res.end('server error')
        })
    }

    listen(...args) {
        let server = http.createServer(this.handleRequest.bind(this))
        server.listen(...args)
    }
}

module.exports = Koa
