// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// chrome.runtime.onInstalled.addListener(function() {
//   chrome.storage.sync.set({color: '#3aa757'}, function() {
//     console.log('The color is green.');
//   });
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {//declare rules/conditions for when to run, need permission
//     chrome.declarativeContent.onPageChanged.addRules([{
//       conditions: [new chrome.declarativeContent.PageStateMatcher({
//         pageUrl: {hostEquals: 'developer.chrome.com'},//URL condition
//       })],
//       actions: [new chrome.declarativeContent.ShowPageAction()]
//     }]);
//   });
// });



// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener((tab)=>{
//   // Send a message to the active tab
//   chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
//     var activeTab = tabs[0];//i assume this is required because you want to isolate the content.js on that page?
//     chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
//   });
// });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
//     if(request.message === "open_new_tab"){
//         chrome.tabs.create({"url": request.url});
//     };
// });
chrome.storage.sync.set({animeTabs: [], processing: false}, ()=>{
    console.log('inital setup for animeTabs:', []);
    console.log('inital value of PROCESSING:', false);
});

let toggleProcessing = () => {
    chrome.storage.sync.get(['processing'], (result)=>{
        console.log('toggle start');
        chrome.storage.sync.set({processing: !result}, ()=>{
            console.log('setting processing to:', !result);
        });
    });
};





chrome.runtime.onConnect.addListener((port)=>{
    if(port.name === "sync"){
        port.onMessage.addListener((msg)=>{
            if(msg.message === "open_new_unfocused_tab"){
                chrome.tabs.create({"url": msg.url, "active": false}, (newTab)=>{
                    console.log("id of new tab:", newTab.id);
                    let animeData = {
                        tabId: newTab.id,
                        animeId: msg.animeId
                    };

                    chrome.storage.sync.get(['animeTabs'], (result)=>{
                        // console.log('getting from storage', result.animeTabs);
                        // console.log('going to save animeData:', animeData);
                        let animeTabs = result.animeTabs;
                        animeTabs.push(animeData);
                        // console.log('going to save animeTabs:', animeTabs);
                        chrome.storage.sync.set({animeTabs: animeTabs}, ()=>{
                            console.log('saving:', animeTabs);
                        });
                    });

                    // chrome.tabs.sendMessage(animeData.tabId, {"message": "go edit"}, ()=>{
                    //     console.log('sent message to tab with id:', animeData.tabId);
                    // });
                    // chrome.tabs.sendMessage(newTab.id, {"message": "go edit"});// THIS DOESNT CONNECT TO ANIMETAB!------------------------------PRIORITY, DO CONNECT MAYBE
                });
                port.postMessage({reply: "DONE SENDING REQ TO ANIMETAB"})
            };
        })
    } else if (port.name === "animeTab"){
        port.onMessage.addListener((msg)=>{
            if(msg.message === "ready_to_click"){
                console.log('sending click info');
                chrome.storage.sync.get(['animeTabs'], (result)=>{
                    let animeTabs = result.animeTabs[0];
                    console.log('sending:', animeTabs)
                    port.postMessage({reply: "data_for_click", data: animeTabs})
                })

            }
        })
    }
});