const http = require('http')
const createHandler = require('github-webhook-handler')
const {
    spawn
} = require("child_process")
const handler = createHandler({
    path: '/webhook',
    secret: 'SYF521314trr'
})

function run_cmd(cmd, args, callback) {
    const child = spawn(cmd, args)
    console.log("[[[[[[[[[[[")
    let resp = ""
    child.stdout.on("data", (buffer) => {
        console.log("1111111111111111")
        resp += buffer.toString()
    })
    child.stdout.on("end", () => {
        console.log("0000000000000000000000999999999")
        callback(resp)
    })
}

http.createServer(function (req, res) {
    handler(req, res, function (err) {
        res.statusCode = 404
        res.end('no such location')
    })
}).listen(7777, () => {
    console.log("服务已启动 in 7777")
})

handler.on("*", (event) => {
    console.log(event, "event")
    run_cmd("sh", ['./deploy.sh'], (txt) => {
        console.log(txt, "txt")
    })
})

handler.on('error', function (err) {
    console.error('Error:', err.message)
})

handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref)
})

handler.on('issues', function (event) {
    console.log('Received an issue event for %s action=%s: #%d %s',
        event.payload.repository.name,
        event.payload.action,
        event.payload.issue.number,
        event.payload.issue.title)
})