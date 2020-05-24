let socket = io()

function presentLoader() {
  $('#loader').css('display', 'block')
}

function dismissLoader() {
  $('#loader').css('display', 'none')
}

$(()=>{
  if (localStorage.getItem('id')) {
    socket.emit('getLoggedInUser', {
      id: localStorage.getItem('id'),
      name: localStorage.getItem('name'),
      privateChatId: localStorage.getItem('privateChatId'),
    })
    presentLoader();
  }

$('.loginModal').css('display', 'block')
$('.chatModal').css('display', 'none')
$('#accpetJoinBox').css('display', 'none')
$('#login').attr("disabled", true)
$('#login').click(() => {
  socket.emit('saveUser', {
    name: $('#u').val(),
    id: 1,
    color: $('#c').val(),
    privateChatId: $('#private').val(),

  })
  localStorage.setItem("name", $('#u').val())
  localStorage.setItem("id", 1)
  localStorage.setItem("color", $('#c').val())
  localStorage.setItem("privateChatId", $('#private').val())
  presentLoader()
})
$('#logout').click(() => {
  presentLoader()
  socket.emit('removeUser', {
    name: localStorage.getItem('name')
  })
})
$('#private').change((e) => {
  if (e.target.value)
    $('#login').attr("disabled", false)
})
$('form').submit(function (e) {
  e.preventDefault(); // prevents page reloading
  socket.emit('onChatMessage', {
    user: {
      name: localStorage.getItem("name"),
      id: localStorage.getItem("id"),
      color: localStorage.getItem("color"),
      privateChatId: localStorage.getItem("privateChatId"),
    },
    msg: $('#m').val(),
    privateChatId: localStorage.getItem("privateChatId")
  });
  $('#m').val('');
  return false;
});


  
  socket.on('afterLogout', (data) => OnAfterLogout(data))
  socket.on('joinReqesut', (data) => OnJoinRequest(data));
  socket.on('joinRequsetSent', (data) => OnJoinRequestSent(data));
  socket.on('joiningAccepted', (data) => OnJoinRequestAccepted(data));
  socket.on("joiningDeclined", (data) => OnJoinRequestDeclined(data));
  socket.on('onChatMessage', (data) => OnChatMessageRecevied(data));
  socket.on('onCaneclJoinRequest', (data) => onCaneclJoinRequest(data));
  socket.on('allowLogin', (user) => OnAllowLogin(user))
  socket.on('error', (error) => OnAllErrors(error))

});

function OnAfterLogout(user) {
  console.log(user, localStorage.getItem('name'));
  if (user.name == localStorage.getItem('name')) {
    localStorage.clear()
    window.location.reload()
  }
}

function OnJoinRequest(user) {
  $(`#loader`)
    .append(` 
        <div id="requestJoin" class="requestJoin">
        <h1>Room In Use</h1>
        <h2>Waiting For Owner To Allow You To Join</h2>
        <button class="btn1" id="cancel">Cancel Request</button>
        </div>
              `)

  $('#cancel').click(() => {
    socket.emit('cancelJoinRequset', user)
  })
  socket.emit('sendingJoinRequset', user)

}

function OnJoinRequestSent({
  owner,
  user
}) {
  if (owner.owner == localStorage.getItem('name')){
    $('#accpetJoinBox').css('display', 'block')
    $('#removeBox').remove()
    $(`#accpetJoinBox`).append(`
    <div id="removeBox" class="acceptJoinBox"> 
        <h1>Reqeust Join From ${user.name}</h1>
        <button class="btn1" id="acceptJoin">Accept</button>
        <button class="btn1" id="declineJoin">Decline</button>
        </div>`)
  }
    

  $('#acceptJoin').click(() => {
    socket.emit('sendingAcceptRequset', user)
  });
  $('#declineJoin').click(() => {
    socket.emit('sendingDeclineRequset', user)
  });
}

function onCaneclJoinRequest(user) {
  $('#requestJoin').remove()
  $('#loader').css('display', 'none')
  $('#accpetJoinBox').css('display', 'none')
}

function AllowActionBasedOnUser(user) {
  return new Promise((resolve, reject) => {
    if (user.name == localStorage.getItem('name')) {
      console.log(user);
      resolve(user)
    }
  })
}

function OnJoinRequestDeclined(user) {
  $('#accpetJoinBox').css('display', 'none')
  AllowActionBasedOnUser(user).then(() => {
    window.location.reload()
  })
}

function OnJoinRequestAccepted(user) {
  dismissLoader()
  $('#accpetJoinBox').css('display', 'none')
  $('.loginModal').css('display', 'none')
  $('.chatModal').css('display', 'block')
  socket.emit('saveUserAfterJoinRequestAccept', user)
}

function OnAllowLogin(user){
  AllowActionBasedOnUser(user).then((user) => {
    dismissLoader()
    $('.loginModal').css('display', 'none')
    $('.chatModal').css('display', 'block')
  })
}
function OnAllErrors(error){
  dismissLoader()
}
function OnChatMessageRecevied(data) {
  let meassage;
  let messageBoxStyle = `box-shadow: 2px 3px 20px 3px ${data.user.color}`
  console.log(data);

  if (data.privateChatId == localStorage.getItem("privateChatId"))
    if (data.user.name != localStorage.getItem('name')) {
      meassage = $(`<p class="offset-sm-6  col-sm-6" >`)
        .append(` 
                <div class="p-3 fadeIn bg-white rounded  " style="border: 1px solid ${data.user.color};${messageBoxStyle}">
                <span class="badge badge-light" style="color:${data.user.color}">${data.user.name}:</span>   
                <p class="text-wrap ">${data.msg}</p>    
                </div>
                `)
    } else {
      meassage = $(`<p class="col-sm-6" >`)
        .append(` 
                <div class="p-3 fadeIn bg-white rounded " style="border: 1px solid ${data.user.color};${messageBoxStyle}">
                  <span class="badge badge-light" style="color:${data.user.color}">You:</span>
                <p class="text-wrap ">${data.msg}</p>    
                </div>
                `)
    }
  $('#messages').append(meassage);
  if (data.msg == "11") {
    $('audio').get(0).load();
    $('audio').get(0).play();
  }
  let meassagePos = meassage.position()
  console.log(meassagePos);

  $('html').scrollTop(meassagePos.top)
}