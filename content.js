// alert('HELLO FROM CONTENT JS')
//NOTE: CONTENT JS CANNOT USE MOST chrome. APIs APART FROM .extension, .runtime, .storage, .i18n
window.onload = ()=>{//-----------------------------------------------------------STRUGGLE! WHY IS THIS REQ FOR MY NODELIST?!!?
    //-----------------------------------------------------------------SHOULDNT run_at DOCUMENT IDLE SOLVE THIS WHYYYYYYY



console.log('testing from content js');
var port = chrome.runtime.connect({name: "sync"});

//check if user has user data saved,
port.postMessage({message: "check_login_info"});
port.onMessage.addListener((msg)=>{
    console.log('msg in content', msg);
    //if there is no user data saved, make form to get username and password for background
    if (msg.reply === "need_login_info"){
        console.log('proceeding to get login info')
        let div = $("<div class='login-inputs'></div>").css({"height": "140px", "width": "250px", "position": "absolute", "top": "0", "right": "0", "background-color": "white", "border": "1px solid black", "padding": "1px 10px 1px 10px"});

        let header = $("<h5>MAL Login Info</h5>");
        let usernameInput = $("<input type='text' placeholder='Username' class='username-input'/>").css({"display": "block"});
        let passwordInput = $("<input type='password' placeholder='Password' class='password-input'/>").css({"display": "block"});
        let submitBtn = $("<button>Save Info</button>").on("click", ()=>{
            let data = {
                username: $('.username-input').val(),
                password: $('.password-input').val()
            }
            port.postMessage({reply: "sending_login_info", data: data});
        });
        div.append([header, usernameInput, passwordInput, submitBtn]);
        $("body").append(div);
    //if background has saved your form data, hide the form.
    } else if (msg.reply === "saved_login_info"){
        $(".login-inputs").hide();
        console.log("login info transfer complete, hiding form");
        port.postMessage({message: "check_login_info"}); //again, this time to create tab
    }
})



let urlString = location.href.toString();
let splitString = urlString.split('/');
let showTitle = splitString[4];
let queryString = showTitle.replace(/-/g, '%20');
console.log('show title:', queryString)

var nodeList = document.querySelectorAll(".hs-magnet-link");
// console.log(nodeList);
// var links = Array.prototype.slice.call( htmlCollection )
var links = [...nodeList]
// var links = Array.from(htmlCollection);
// console.log(links)
// console.log(links[0])

//make every link also a href to the
links.map(link=>{
    link.childNodes[0].onclick = () =>{//directly target the <a> link
        console.log('clicked!', link);

        //get episode number from ID
        let episodeNumber = link.parentNode.id.substring(0,2);
        console.log("ep number:", episodeNumber);

        //AJAX for anime URL
        var request = new XMLHttpRequest();

        request.addEventListener("load", function(){
          let responseData = JSON.parse( this.responseText );
          if (responseData === null){
            alert('Failed to create group! Try another group name.')
          } else {
            let anime = responseData.results[0];

            //send anime data to background for syncing
            port.postMessage({message: "open_new_unfocused_tab", "url": anime.url, "animeId": anime.mal_id, "episodeNumber": episodeNumber});
          };
        });
        request.open("GET", `https://api.jikan.moe/v3/search/anime?q=${queryString}`);
        request.send();
    };
});


}


//here, content can grab href URL but cannot use chrome.tabs.
//on the other hand, background can use chrome.tabs but cannot grab URL

//if you want to use browser actions like icon clicks, LISTEN IN BACKGROUND
//Then, make background tell content to give it info.
//Then, use content to give background the URL.
//Background profits and opens the tab with the URL.