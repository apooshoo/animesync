console.log("in anime tab")
//pre-click add to list
// <a href="https://myanimelist.net/javascript:void(0)" onclick="return false;" id="myinfo_status" class="btn-user-status-add-list js-form-user-status js-form-user-status-btn  myinfo_addtolist" data-value="6" data-class="plantowatch">Add to List</a>
//postclick
// <a href="https://myanimelist.net/javascript:void(0)" onclick="return false;" id="myinfo_status" class="btn-user-status-add-list js-form-user-status js-form-user-status-btn  myinfo_addtolist" data-value="6" data-class="plantowatch">Add to List</a>
//data class changes

var port = chrome.runtime.connect({name: "animeTab"});
let loginBtn = document.querySelectorAll('#malLogin');
console.log(loginBtn);
if (loginBtn[0] === undefined){
    console.log('confirmed logged in');
    port.postMessage({message: "ready_to_click"});
} else {
    console.log("not logged in yet");
    port.postMessage({message: "ready_to_login"});
}
// port.postMessage({message: "ready_to_click"});
port.onMessage.addListener((msg)=>{
    if(msg.reply === "data_for_click"){
        console.log("data in animeTab:", msg.data);
        let addToListBtn = document.querySelectorAll('.myinfo_addtolist')[0];
        if (addToListBtn === undefined){
            console.log('already added, changing other info now');

            let episodesSeenInput = document.querySelectorAll('#myinfo_watchedeps')[0];//NOTE: THIS PART ONWARDS DOESNT WORK FOR LOGN RUNNING SERIES WITHOUT END DATE (like black clover and boruto)
            episodesSeenInput.value = msg.data.episodeNumber;

            let totalEpisodes = document.querySelectorAll('#curEps')[0].innerHTML;
            if (totalEpisodes === msg.data.episodeNumber){
                let statusBtn = document.getElementById('myinfo_status');
                let completedOption = statusBtn.childNodes[1];
                completedOption.selected = true;
            };

            let updateBtn = document.querySelectorAll('.inputButton')[1];
            updateBtn.click();

            port.postMessage({reply: "changed episode info"});
        } else {
            console.log('simulating click on addToListBtn');
            addToListBtn.click();
            port.postMessage({reply: "added to list"});
        };
    };
});