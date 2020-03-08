    let users = []
    let user;
    $('#login').attr("disabled", true)
    socket.on('availableColors', (availableColors) => {
      availableColors.forEach(color => {
        $('#c').append(`<option value="${color.value}">${color.name}</option>`)
      });
    })
    socket.on('onlineUsers', (onlineUsers) => {
      users = onlineUsers
      user = users.find(user => user.id == localStorage.getItem("id"))
      if (user) {
        $('.loginModal').css('display', 'none')
        $('#chatBody').css('display', 'block')
      }

    })

    $('#login').click(() => {
      users.push({
        name: $('#u').val(),
        id: users.length + 1,
        color: $('#c').val(),
        privateChatId: $('#private').val(),

      })
      socket.emit('saveUser', users)
      localStorage.setItem("username", $('#u').val())
      localStorage.setItem("id", users.length)
      localStorage.setItem("privateChatId",$('#private').val())
      $('.loginModal').css('display', 'none')
      $('#chatBody').css('display', 'block')
    })
    $('#logout').click(() => {
      users = users.filter(user => user.id != localStorage.getItem("id"))
      socket.emit('removeUser', users)
      localStorage.clear()
      window.location.reload()
    })
    $('#private').change((e) => {
      if (e.target.value)
        $('#login').attr("disabled", false)
    })

    $(function () {
      let user
      $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading

        socket.emit('user message', users.find(user => user.id == localStorage.getItem("id")));
        socket.emit('chat message', {
                                    msg:$('#m').val(),
                                    p:users.find(user => user.id == localStorage.getItem("id")).privateChatId
                                  });
        $('#m').val('');
        return false;
      });
      socket.on('user message', (user1) => {
        user = user1
      })
      socket.on('chat message', function (msg) {
        let p;
        let messagePopStyle = `box-shadow: 2px 3px 20px 3px ${user.color}`
        console.log(msg,user);
        
        if(msg.p == localStorage.getItem("privateChatId"))
        if (user.name != localStorage.getItem('username')) {
          p = $(`<p class="offset-sm-6  col-sm-6" >`)
            .append(` 
                    <div class="p-3 fadeIn bg-white rounded  " style="border: 1px solid ${user.color};${messagePopStyle}">
                    <span class="badge badge-light" style="color:${user.color}">${user.name}:</span>   
                    <p class="text-wrap ">${msg.msg}</p>    
                    </div>
                    `)
        } else {
          p = $(`<p class="col-sm-6" >`)
            .append(` 
                    <div class="p-3 fadeIn bg-white rounded " style="border: 1px solid ${user.color};${messagePopStyle}">
                      <span class="badge badge-light" style="color:${user.color}">${user.name}:</span>
                    <p class="text-wrap ">${msg.msg}</p>    
                    </div>
                    `)
        }
        $('#messages').append(p);
        if (msg == "11") {
          $('audio').get(0).load();
          $('audio').get(0).play();
        }
        let pPos = p.position()
        console.log(pPos);

        $('html').scrollTop(pPos.top)
      });
    
    });