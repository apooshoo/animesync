chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    if(request.message === "go edit"){
        console.log('received msg in tab')
    }
});

// chrome.tabs.query({active: false}, (tabs)=>{
//     console.log(tabs[tabs.length-1])
// });