class SocketService {
    connection(socket) {
        socket.on('disconnect', () => {
            console.log(`Disconnected user id is: ${socket.id}`);
        });

        socket.on('join group', (groupId) => {
            socket.join(groupId);
        });

        socket.on('message', ({ groupId, message }) => {
            socket.emit('message', { groupId, message } );
            socket.broadcast.to(groupId).emit('message', { groupId, message });
        });

        socket.on('seen', (groupId) => {
            socket.broadcast.to(groupId).emit('seen', groupId);
        });

    }
}

module.exports = new SocketService();
