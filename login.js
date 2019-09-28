console.log('in login tab')

var port = chrome.runtime.connect({name: "login"});


port.postMessage({message: "inputting_login_info"});

port.onMessage.addListener((msg)=>{
    console.log(msg)
    if(msg.reply === "login_info"){
        $("#loginUserName").val(`${msg.data.username}`);
        $("#login-password").val(`${msg.data.password}`);
        $(".inputButton[name=sublogin]").click();
    } else if (msg.reply === "abort_login"){
        console.log('login failed, stopping login');
    };
});

 // (response)=>{
//     console.log("response in login", response)
//     $("#loginUserName").val(`${response.data.username}`);
//     $("#login-password").val(`${response.data.password}`);
//     $(".inputButton[name=sublogin]").click();
//     // usernameInput.val(`${response.data.username}`);
//     // passwordInput.val(`${response.data.password}`);

//     // console.log(submitBtn)
//     // console.log(usernameInput.val())
//     // console.log(passwordInput.val())
// });