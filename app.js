var app = require('express')();
var express = require('express')
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use("/static", express.static('./static/'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
let onlineUsers = fs.readFileSync('./static/onlineUsers.json').toString()
let availableColors = fs.readFileSync('./static/availableColors.json').toString()

io.on('connection', function(socket){
    io.emit('onlineUsers',onlineUsers)
    io.emit('availableColors',availableColors)

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
      });
      socket.on('user message', function(user){
        io.emit('user message', user);
        
      });

      socket.on('saveUser',(users)=>{
        fs.writeFileSync('./static/onlineUsers.json',JSON.stringify(users))
      })
      socket.on('removeUser',(users)=>{
        
        fs.writeFileSync('./static/onlineUsers.json',JSON.stringify(users))
      })


});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

