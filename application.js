let http = require('http')
let EventEmitter = require('events')
let Stream = require('stream')
let context = require('./context')
let request = require('./request')
let response = require('./response')

class Koa extends EventEmitter {
    constructor() {
        super()
        this.fn
        this.context = context
        this.request = request
        this.response = response
    }

    use(fn) {
        this.fn = fn
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

    handleRequest(req, res) {
        res.statusCode = 404
        let ctx = this.createContext(req, res)
        this.fn(ctx)
        if (typeof ctx.body == 'object') {
            res.setHeader('Content-Type', 'application/json;charset=utf8')
            res.end(JSON.stringify(ctx.body))
        } else if (ctx.body instanceof Stream) {
            ctx.body.pipe(res)
        }
        else if (typeof ctx.body === 'string' || Buffer.isBuffer(ctx.body)) {
            res.setHeader('Content-Type', 'text/htmlcharset=utf8')
            res.end(ctx.body)
        }else{
            res.end('Not found')
        }
    }

    listen(...args) {
        let server = http.createServer(this.handleRequest.bind(this))
        server.listen(...args)
    }
}

module.exports = Koa
