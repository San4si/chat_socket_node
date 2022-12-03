const socket = io();
let username= '';
let userlist = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserlist(){
    let ul = document.querySelector('.userlist');
    ul.innerHTML = '';

    userlist.forEach(i => {
        ul.innerHTML += '<li>'+i+'</li>';
    });
}

function addMessage(type, user, msg){
    let ul = document.querySelector('.chatlist');

    switch(type){
        case 'status':
            ul.innerHTML += '<li class="m-status">'+msg+'</li>';
        break;
        case 'msg':
            if(username == user){
                ul.innerHTML += '<li class="m-txt"><span class="me">'+user+'</span> '+msg+'</li>'
            }
            ul.innerHTML += '<li class="m-txt"><span>'+user+'</span> '+msg+'</li>'
            break;
    }

    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        let name = loginInput.value.trim();
        if(name != ''){
            username = name;
            document.title = 'Chat ('+username+')';

            //Envio de mensagem para o servidor
            socket.emit('join-request', username);
        }
    }
});

textInput.addEventListener('keyup',(e) =>{
    if(e.keyCode === 13){
        let txt = textInput.value.trim();
        textInput.value = '';

        if(txt != ''){
            addMessage('msg', username, txt);
            socket.emit('send-msg', txt);
        }
    }
})

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conectado!');

    userlist = list;
    renderUserlist();
})

socket.on('list-update',(data) => {
    if(data.joined){
        addMessage('status', null, data.joined+' entrou no chat.');
    }

    if(data.left){
        addMessage('status', null, data.left+' saiu do chat.');
    }

        userlist = data.list;
        renderUserlist();
});

socket.on('show-msg', (data) => {
    addMessage('msg', data.username,data.message);
});

socket.on('disconnect', () =>{
    addMessage('status', null, 'Você foi desconectado!');
    //limpando a lista e renderizando sem nada
    userlist = [];
    renderUserlist();
});

socket.on('connect_error', () =>{
    addMessage('status', null, 'Tentando reconectar....');
});

socket.on('connect', () => {
    addMessage('status', null, 'Reconectado!');

    if(username != ''){
        socket.emit('user-request', username);
    }
})