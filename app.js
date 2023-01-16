const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
app.set('view engine', 'ejs');
app.use(express.static('public'));

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
app.use('/peerjs', peerServer);
app.get('/', (req, res) => {
    res.redirect(`${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log(`user ${userId} joined ${roomId}`);
        socket.join(roomId);
        socket.on('ready', () => {
            socket.broadcast.to(roomId).emit('user-connected', userId);
        })
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })

})

const port = 5000
server.listen(port, console.log(`server is listening port ${port} ...`));