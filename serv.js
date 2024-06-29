// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require("mongoose");
const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const json2xls = require('json2xls');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);


const PORT = process.env.PORT || 3000;

let clients = {}; // Store clients' information



// Function to save clients data to a JSON file and emit the data
const saveClientsToJsonFile = async () => {
  try {
    await fs.writeJson('clients_data.json', clients, { spaces: 2 });
    console.log('Clients data saved to clients_data.json');
   
  } catch (err) {
    console.error('Error saving clients data to JSON file', err);
  }
};
const emitClientsDataFromFile = async () => {
  try {
    const data = await fs.readJson('clients_data.json');
    io.emit('jsonDataUpdate', data);
  } catch (err) {
    console.error('Error reading clients data from JSON file', err);
  }
};


// Function to read data for a specific client from the JSON file
const getClientDataFromFile = async (clientId) => {
  try {
    const data = await fs.readJson('clients_data.json');
    return data[clientId] ? data[clientId].data : null;
  } catch (err) {
    console.error('Error reading clients data from JSON file', err);
    return null;
  }
};
io.on('connection', socket => {
  console.log(`Client connected: ${socket.id}`);

  // Handle incoming message from client
  socket.on('message', data => {
    console.log(`Message from client ${socket.id}: ${data}`);

    // Store or process the received data as needed
    clients[socket.id] = { id: socket.id, data: data };
 
 
    saveClientsToJsonFile();

    // Broadcast updated client list to all clients
    io.emit('clients', Object.values(clients));

    // Emit data update specific to this client
    io.emit(`clientDataUpdate_${socket.id}`, data);
    
  });



  // Handle client requesting its own data
  socket.on('getClientData', async clientId => {
    // if (clients[clientId]) {
    //   socket.emit(`clientDataUpdate_${clientId}`, clients[clientId].data);
    // }
    const clientData = await getClientDataFromFile(clientId);
    if (clientData) {
      socket.emit(`clientDataUpdate_${clientId}`, clientData);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    delete clients[socket.id];

    saveClientsToJsonFile();
    io.emit('clients', Object.values(clients));
  });
});
  // Remove client data from the worksheet


  // Set an interval to periodically read the JSON file and emit its contents
setInterval(emitClientsDataFromFile, 3000); // Interval set to 2 seconds (2000 milliseconds)
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
