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
chrome.storage.sync.set({animeTabs: []}, ()=>{
    console.log('inital setup for animeTabs:', []);
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    if(request.message === "open_new_unfocused_tab"){
        // console.log("URL:", request.url); //req has message, url and animeId
        chrome.tabs.create({"url": request.url, "active": false}, (newTab)=>{
            console.log("id of new tab:", newTab.id);
            let animeData = {
                tabId: newTab.id,
                animeId: request.animeId
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


        });
    };
});