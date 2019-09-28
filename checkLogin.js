console.log('in checklogin');
var port = chrome.runtime.connect({name: "checkLogin"});

let loginBtn = $('.btn-login')[0];
// console.log(loginBtn);
if (loginBtn === undefined){
    console.log('already logged in!')
    port.postMessage({message: "already_logged_in"});
} else {
    console.log('not logged in yet')
    port.postMessage({message: "redirect_to_login"});
}

port.onMessage.addListener((msg)=>{
    console.log(msg)
})