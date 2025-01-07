const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"))

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('screen', (data) => {
        // Broadcast the screen stream to all other clients
        socket.broadcast.emit('screen', { id: socket.id, tracks: data.tracks });
    });

    socket.on('offer', (data) => {
        // Send the offer to the receiver
        socket.to(data.to).emit('offer', { sdp: data.sdp, from: socket.id });
    });

    socket.on('answer', (data) => {
        // Send the answer to the originating peer
        socket.to(data.to).emit('answer', { sdp: data.sdp, from: socket.id });
    });

    socket.on('ice-candidate', (data) => {
        // Send the candidate to the designated peer
        socket.to(data.to).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});