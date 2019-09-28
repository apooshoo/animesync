console.log("in anime tab")
//pre-click add to list
// <a href="https://myanimelist.net/javascript:void(0)" onclick="return false;" id="myinfo_status" class="btn-user-status-add-list js-form-user-status js-form-user-status-btn  myinfo_addtolist" data-value="6" data-class="plantowatch">Add to List</a>
//postclick
// <a href="https://myanimelist.net/javascript:void(0)" onclick="return false;" id="myinfo_status" class="btn-user-status-add-list js-form-user-status js-form-user-status-btn  myinfo_addtolist" data-value="6" data-class="plantowatch">Add to List</a>
//data class changes

var port = chrome.runtime.connect({name: "animeTab"});
port.postMessage({message: "ready_to_click"});
port.onMessage.addListener((msg)=>{
    if(msg.reply === "data_for_click"){
        console.log("data in animeTab:", msg.data);
        let addToListBtn = document.querySelectorAll('.myinfo_addtolist')[0];
        if (addToListBtn === undefined){
            console.log('already added, changing other info now');

            let episodesSeenInput = document.querySelectorAll('#myinfo_watchedeps')[0];
            episodesSeenInput.value = msg.data.episodeNumber;
            console.log("episodesSeenInput", episodesSeenInput);

            let totalEpisodes = document.querySelectorAll('#curEps')[0].innerHTML;
            console.log(totalEpisodes);
            if (totalEpisodes === msg.data.episodeNumber){
                console.log('same!')
                let statusBtn = document.getElementById('myinfo_status');
                console.log("statusBtn:", statusBtn);
                let completedOption = statusBtn.childNodes[1];
                completedOption.selected = true;
            };

            let updateBtn = document.querySelectorAll('.inputButton')[1];
            console.log(updateBtn)
            updateBtn.click();
            console.log('clicked!')

            port.postMessage({reply: "changed episode info"});
        } else {
            console.log('simulating click on addToListBtn');
            addToListBtn.click();
            port.postMessage({reply: "added to list"});
        };
    };
});