// alert('HELLO FROM CONTENT JS')
//NOTE: CONTENT JS CANNOT USE MOST chrome. APIs APART FROM .extension, .runtime, .storage, .i18n

console.log('testing from content js');
// let a = document.getElementsByTagName('a');
// let firstHref = a[0];
// console.log(firstHref)

//note: the whole point of content is to grab info for background.js!

let urlString = location.href.toString();
let splitString = urlString.split('/');
let showTitle = splitString[4];
let queryString = showTitle.replace(/-/g, '%20');
console.log('show title:', queryString)

var htmlCollection = document.getElementsByClassName('hs-magnet-link');
// console.log(htmlCollection);
var links = Array.from(htmlCollection);
links.map(link=>{
    link.parentNode.onclick = () =>{//remove parentNode when you're done testing- go back to magnet-link
        // chrome.runtime.sendMessage({"message": "open_new_unfocused_tab", })
        console.log('clicked!');
        var request = new XMLHttpRequest();

        request.addEventListener("load", function(){
          let responseData = JSON.parse( this.responseText );
          if (responseData === null){
            alert('Failed to create group! Try another group name.')
          } else {
            let anime = responseData.results[0];
            console.log("Returned anime:", anime);
            // chrome.runtime.sendMessage({"message": "open_new_unfocused_tab", "url": anime.url, "animeId": anime.mal_id});
            var port = chrome.runtime.connect({name: "sync"});
            port.postMessage({message: "open_new_unfocused_tab", "url": anime.url, "animeId": anime.mal_id});
            port.onMessage.addListener((msg)=>{
                console.log(msg)
            });
          };
        });
        // request.open("GET", 'https://api.jikan.moe/v3/search/manga?q=grand%20blue&page=1');
        request.open("GET", `https://api.jikan.moe/v3/search/anime?q=${queryString}`);
        request.send();
    };
});




// chrome.runtime.onMessage.addListener(
//   (request, sender, sendResponse)=>{
//     if( request.message === "clicked_browser_action" ) {
//         let a = document.getElementsByTagName('a');
//         let firstHref = a[0].href;
//         console.log(firstHref)
//         chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
//     };
//   }
// );

//here, content can grab href URL but cannot use chrome.tabs.
//on the other hand, background can use chrome.tabs but cannot grab URL

//if you want to use browser actions like icon clicks, LISTEN IN BACKGROUND
//Then, make background tell content to give it info.
//Then, use content to give background the URL.
//Background profits and opens the tab with the URL.