console.log('in login tab')

var port = chrome.runtime.connect({name: "login"});


port.postMessage({message: "inputting_login_info"});

port.onMessage.addListener((msg)=>{
    console.log(msg)
    if(msg.reply === "login_info"){
        $("#loginUserName").val(`${msg.data.username}`);
        $("#login-password").val(`${msg.data.password}`);
        $(".inputButton[name=sublogin]").click();
        port.postMessage({reply: "done_login"});
    } else if (msg.reply === "abort_login"){
        console.log('login failed, stopping login');
    };
});