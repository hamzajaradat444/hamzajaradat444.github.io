let socket = io()
function presentLoader() {
  $('#loader').css('display', 'block')
}
function dismissLoader() {
  $('#loader').css('display', 'none')
}
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
  socket.emit('removeUser', { name: localStorage.getItem('name') })
})
$('#private').change((e) => {
  if (e.target.value)
    $('#login').attr("disabled", false)
})
$('form').submit(function (e) {
  e.preventDefault(); // prevents page reloading

  socket.emit('chat message', {
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

$(function () {
  if (localStorage.getItem('id')) {
    socket.emit('getLoggedInUser', {
      id: localStorage.getItem('id'),
      name: localStorage.getItem('name'),
      privateChatId: localStorage.getItem('privateChatId'),
    })
    presentLoader();
  }
  socket.on('availableColors', (availableColors) => {
    availableColors.forEach(color => {
      $('#c').append(`<option value="${color.value}">${color.name}</option>`)
    });
  })

  socket.on('allowLogin', (user) => {

    if (user.name == localStorage.getItem('name')) {
      dismissLoader()
      $('.loginModal').css('display', 'none')
      $('#chatBody').css('display', 'block')
    }
  })

  socket.on('allowLoginAfterSave', (user) => {

    if (user.name == localStorage.getItem('name')) {
      dismissLoader()
      $('.loginModal').css('display', 'none')
      $('#chatBody').css('display', 'block')
    }
  })

  socket.on('afterLogout', (user) => {
    console.log(user, localStorage.getItem('name'));

    if (user.name == localStorage.getItem('name')) {
      localStorage.clear()
      window.location.reload()
    }

  })

  socket.on('chat message', function (data) {
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
  });
  socket.on('error', () => {
    dismissLoader()
  })

});