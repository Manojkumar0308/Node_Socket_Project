const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

const clients = {};
// Socket.IO logic
io.on('connection', (socket) => { 
    console.log('A client connected:', socket.id);

  

    socket.on('message', function (data) {
        console.log('Message received: ', data);
               // Update client data
     
        // Broadcast the message to all clients
        // io.emit('message', { id: socket.id, data: data });
        io.emit('message', data );

    });


    socket.send("hello client i am Manoj kumar");
   
   

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // clients = clients.filter(clientId => clientId !== socket.id);
        
       
    });

});

// Handle HTTP requests
// app.get('/', (req, res) => {
//     const randomNumber = Math.floor(Math.random() * 100);

//     // Emit a message to all connected clients including the sender
//     io.emit('msg', { number: 567 });

//     res.status(200).json({ number: 111 });
// });
app.get('/socket.io/?EIO=4', (req, res) => {
    res.send('Socket.IO server');
    io.on('connection', (socket) => {
        console.log('A client connected:', socket.id);
        socket.on('message', function (data) {
            console.log('Message received: ', data);
            io.emit('message',data)
        });
    
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    
    });
    
   


});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});