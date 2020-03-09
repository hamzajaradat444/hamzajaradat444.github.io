var app = require('express')();
var express = require('express')
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use("/assets", express.static('./assets/'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
/* let onlineUsers1 = fs.readFileSync('./static/onlineUsers.json').toString()
let availableColors2 = fs.readFileSync('./static/availableColors.json').toString() */

let onlineUsers = []
let availableColors =[]

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
        /* fs.writeFileSync('./static/onlineUsers.json',JSON.stringify(users)) */
        console.log(users,"on save");
        onlineUsers=users
        
      })
      socket.on('removeUser',(users)=>{
        console.log(users,"on remove");
        onlineUsers=users
        /* fs.writeFileSync('./static/onlineUsers.json',JSON.stringify(users)) */
      })


});
let port  = process.env.PORT||3000
http.listen(port, function(){
  console.log('listening on *:' + port);
});

