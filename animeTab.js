console.log("ANIME TAB WORKS")//------THIS WORKS
// chrome.runtime.onConnect.addListener((port)=>{
//     port.onMessage.addListener((msg)=>{
//         console.log("msg:", msg)
//         if(msg.message === "TEST"){
//             console.log("SUCC IN ANIMETAB")
//         }
//     })
// })

var port = chrome.runtime.connect({name: "animeTab"});
port.postMessage({message: "ready_to_click"});
port.onMessage.addListener((msg)=>{
    if(msg.reply === "data_for_click"){
        console.log("data in animeTab:", msg.data);
    };
});
//LISTEN FOR REPLY!!_-----------------------------------------------------------
// chrome.tabs.query({active: false}, (tabs)=>{
//     console.log(tabs[tabs.length-1])
// });