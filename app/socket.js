const socket = require('socket.io');
const SocketService = require('../services/socketService');

module.exports = function(server) {
    const io = socket(server);
    global._io = io;

    global._io.on('connection', SocketService.connection);
} 