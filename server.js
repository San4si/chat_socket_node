const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));

//varial que vai armazenar a lista de usuários
let connectedUsers = [];

//escutador de conexão
io.on('connection', (socket) => {
    console.log('Conexão detectada....')

    //criando escutadores
    socket.on('join-request', (username) => {
        socket.username = username;
        //joga na lista o none
        connectedUsers.push( username);
        console.log( connectedUsers);//mostrando no console so pra visualizar
        
        socket.emit('user-ok', connectedUsers)//respondendo para o cliente
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });//mensagem para todas as conexoes informando que alguem entrou na sala 
    })

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(u => u != socket.username);
        console.log(connectedUsers);

        socket.broadcast.emit('list-update',{
            left: socket.username,
            list: connectedUsers
        });
    });

    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            message: txt
        };

        //socket.emit('show-msg', obj);
        socket.broadcast.emit('show-msg', obj);
    });
});