let http = require('http')
let EventEmitter = require('events')
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

    listen(...args) {
        let server = http.createServer(this.fn)
        server.listen(...args)
    }
}

module.exports = Koa
