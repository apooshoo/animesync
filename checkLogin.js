console.log('in checklogin');
let loginBtn = $('.btn-login')[0];
console.log(loginBtn);
if (loginBtn === undefined){
    console.log('already logged in!')
    chrome.runtime.sendMessage({"message": "already_logged_in"});
} else {
    console.log('not logged in yet')
    chrome.runtime.sendMessage({"message": "redirect_to_login"});
}