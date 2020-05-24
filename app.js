var app = require('express')();
var express = require('express')
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://hamzajaradat:11q22w33e@firstapi-xscxv.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectId = require('mongodb').ObjectID;

app.use("/assets", express.static('./assets/'));

app.get('/',(req, res)=>{
  res.sendFile(__dirname + '/index.html');
});

io.on('connection',(socket)=>{
  socket.on('getLoggedInUser',(loggedInUser)=>OnGetLoggedInUser(loggedInUser));
  socket.on('saveUser',(user)=>OnSaveUser(user));
  socket.on('removeUser',(user)=>OnRemoveUser(user));
  socket.on('sendingJoinRequset',(user)=>OnSendingJoinRequset(user));
  socket.on('cancelJoinRequset', (user)=>OnCaneclJoinRequest(user));
  socket.on('sendingAcceptRequset',(user)=>OnSendingAcceptRequset(user));
  socket.on('sendingDeclineRequset',(user)=>OnSendingDeclineRequset(user));
  socket.on('saveUserAfterJoinRequestAccept', (user)=>OnSaveAfterJoinRequestAccept(user));
  socket.on('onChatMessage',(msg)=>OnChatMessage(msg));

});

let port  = process.env.PORT||3000
http.listen(port,()=>{
  console.log('listening on *:' + port);
});

async function OnGetLoggedInUser(loggedInUser){
  await client.connect()
  let res =await client.db('Users').collection('loggedInUsers').findOne({name:loggedInUser.name})
  res?io.emit("allowLogin",res):io.emit('error')
  console.log('getLoggedInUser',res,loggedInUser);
}
async function OnSaveUser(user){
  await client.connect()
    let res = await client.db('Users').collection('existingPrivateRooms').findOne({privateRoomId:user.privateChatId})
    if(res){
      io.emit("joinReqesut",user)
    }
    else{
      console.log("Room Available");
      let res1 = await client.db('Users').collection('loggedInUsers').insertOne(user)
      let res2 = await client.db('Users').collection('existingPrivateRooms').insertOne({
        owner:user.name,
        privateRoomId:user.privateChatId
      })
      if(res1&&res2)io.emit("allowLogin",res1.ops[0])
    }
}
async function OnRemoveUser(user){
  await client.connect()
    let res1 = await client.db('Users').collection('loggedInUsers').deleteOne({name:user.name})
    let res2 = await client.db('Users').collection('existingPrivateRooms').deleteOne({owner:user.name})
    console.log('afterLogout',res1.deletedCount,user);
    if(res1.deletedCount)io.emit("afterLogout",user)
}
async function OnSaveAfterJoinRequestAccept(user){
  await client.db('Users').collection('loggedInUsers').insertOne(user)
}
async function OnSendingJoinRequset(user){
    console.log("sendingJoinRequset",user);
    let res = await client.db('Users').collection('existingPrivateRooms').findOne({privateRoomId:user.privateChatId})
    io.emit('joinRequsetSent',{owner:res,user})
}
function OnChatMessage(msg){
  io.emit('onChatMessage', msg);
}
function OnSendingDeclineRequset(user){
  io.emit('joiningDeclined', user);
}
function OnSendingAcceptRequset(user){
  io.emit('joiningAccepted', user);
}
function OnCaneclJoinRequest(user){
  io.emit('onCaneclJoinRequest',user);
}