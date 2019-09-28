console.log('in login tab')

chrome.runtime.sendMessage({"message": "inputting_login_info"}, (response)=>{
    console.log("response in login", response)
    $("#loginUserName").val(`${response.data.username}`);
    $("#login-password").val(`${response.data.password}`);
    $(".inputButton[name=sublogin]").click();
    // usernameInput.val(`${response.data.username}`);
    // passwordInput.val(`${response.data.password}`);

    // console.log(submitBtn)
    // console.log(usernameInput.val())
    // console.log(passwordInput.val())
});