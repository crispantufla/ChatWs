const WebSocketServer = require("ws").Server
const express = require('express');
const http = require("http");
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app)

const wss = new WebSocketServer({server: server})
console.log("websocket server created")

const mongoose = require('mongoose');
const messageModel = require('./models/message');

const main = () => {

    mongoose.connect('mongodb+srv://admin:vA3WC3XFAs8nMWQPcw3PD@cluster0.9lknw.mongodb.net/chat?retryWrites=true&w=majority', { useUnifiedTopology: true ,useNewUrlParser: true })
        .then(db => console.log('db is connected')).catch(err => console.log(err))

    wss.broadcast = (data) => {
        wss.clients.forEach((client) => {
            client.send(JSON.stringify(data));
        });
    }

    wss.on('connection', async socket => {
        let messages = await messageModel.find().lean();
        if (messages.length > 0) {
            messages.forEach((message) => {socket.send(JSON.stringify({author: message.author, content: message.content}))})
        }

        socket.on('message',  async msg => {
            let data = JSON.parse(msg);
            if (data.content) {
                new messageModel({
                    content: data.content,
                    author: data.author
                }).save();
                
                wss.broadcast(data);
            } 
        });
    })

    server.listen(PORT, () => {
        console.log(`server on port ${PORT}`)
    })
}

main()