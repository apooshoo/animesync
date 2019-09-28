// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.storage.local.clear();//rm later

chrome.storage.sync.set({animeTabs: [], processing: false}, ()=>{
    console.log('inital setup for animeTabs:', []);
    console.log('inital value of PROCESSING:', false);
});
chrome.storage.local.set({logging: true}, ()=>{
    console.log('initial value of LOGGING', true);
});


let toggleProcessing = () => {
    chrome.storage.sync.get(['processing'], (result)=>{
        chrome.storage.sync.set({processing: !result.processing}, ()=>{
            console.log('setting processing to:', !result.processing);
        });
    });
};

let clearProcessed = () => {
    chrome.storage.sync.get(['animeTabs'], (result)=>{
        console.log("clearing animeTab");
        let animeTabs = result.animeTabs;
        //delete tab
        // chrome.tabs.get(animeTabs[0].id, ()=>{

        // })
        animeTabs.shift();
        chrome.storage.sync.set({animeTabs: animeTabs}, ()=>{
            console.log("saved animeTabs to storage:", animeTabs);
        })
    })
}

let createNewTab = (msg) => {
    chrome.tabs.create({"url": msg.url, "active": false}, (newTab)=>{
        console.log("id of new tab:", newTab.id);
        let animeData = {
            tabId: newTab.id,
            animeId: msg.animeId,
            episodeNumber: msg.episodeNumber
        };
        toggleProcessing();
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
}

// chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
//     if (request.message === "already_logged_in"){
//         console.log('already logged in!');
//         //CLOSE checkLogin TAB
//     } else if (request.message === "redirect_to_login"){//add code for failed login here
//         console.log('redirecting to login page');
//         chrome.tabs.create({"url": "https://myanimelist.net/login.php?from=%2F", "active": false}, (newTab)=>{
//             chrome.storage.sync.set({loginTabId: newTab.id}, ()=>{
//                 console.log('saving loginTabId', newTab.id);
//             });
//         });
//     } else if (request.message === "inputting_login_info"){
//         console.log("sending input info");
//         chrome.storage.local.get(['username', 'password', 'logging'], (result)=>{
//             console.log("logging", result.logging);
//             if(result.logging === false){
//                 let data = {
//                     username: result.username,
//                     password: result.password
//                 };
//                 sendResponse({data: data});
//                 toggleLogging();
//             } else if (result.logging === true){
//                 console.log('already logging in')
//             }
//         });
//         return true
//     }
// });

chrome.runtime.onConnect.addListener((port)=>{
    if(port.name === "sync"){
        port.onMessage.addListener((msg)=>{
            if(msg.message === "check_login_info"){
                chrome.storage.local.get(['username', 'password'], (result)=>{
                    console.log('local username', result.username);
                    console.log('local password', result.password);
                    if(result.username === undefined || result.password === undefined){
                        console.log('need login info');
                        port.postMessage({reply: "need_login_info"});
                    } else {
                        console.log('have login info!');
                        //LOGIN HERE
                        chrome.tabs.create({"url": "https://myanimelist.net/", "active": false}, (newTab)=>{
                            chrome.storage.sync.set({checkLoginTabId: newTab.id}, ()=>{
                                console.log("saving checkLoginTab id", newTab.id);
                            });
                        });
                    };
                });
            } else if (msg.reply === "sending_login_info"){
                chrome.storage.local.set({username: msg.data.username, password: msg.data.password}, ()=>{
                    console.log('saving user info', msg.data)
                    port.postMessage({reply: "saved_login_info"});
                });
            } else if (msg.message === "open_new_unfocused_tab"){
                chrome.storage.local.get(['username', 'password'], (result)=>{
                    console.log('local username', result.username);
                    console.log('local password', result.password);
                    if(result.username === undefined || result.password === undefined){
                        alert("No user info saved! Please login to MAL manually to continue using this extension")
                        createNewTab(msg);
                    } else {
                        createNewTab(msg);
                    };
                });
                port.postMessage({reply: "DONE SENDING REQ TO ANIMETAB"})
            };
        })
    } else if (port.name === "animeTab"){
        port.onMessage.addListener((msg)=>{
            if(msg.message === "ready_to_click"){
                console.log('sending click info');
                chrome.storage.sync.get(['animeTabs', 'processing'], (result)=>{
                    console.log(result.processing);
                    if(result.processing === true){
                        let animeTabs = result.animeTabs[0];
                        console.log('sending:', animeTabs)
                        port.postMessage({reply: "data_for_click", data: animeTabs})
                    } else {
                        console.log('will not process')//HERE IS WHERE YOU WILL ADD LISTENER FOR WHEN PROCESSING === FALSE.
                        //YOU WILL THEN REDIRECT TO THE APPROPRIATE TAB (tabId of animeTabs[0] to get it to process)
                    };
                });
            } else if (msg.reply === "changed episode info"){
                console.log('changed other info and back in background');
                toggleProcessing();
                clearProcessed();
            } else if (msg.reply === "added to list"){
                console.log('added to list and back in background');
                toggleProcessing();
                clearProcessed();
            } else if (msg.message === "ready_to_login"){
                console.log("gonna get login info in background");
                //remove below when done
                toggleProcessing();
                clearProcessed();
            }
        });
    } else if (port.name === "checkLogin"){
        port.onMessage.addListener((msg)=>{
            chrome.storage.local.get(['logging'], (result)=>{
                if(result.logging === true){
                    if(msg.message === "already_logged_in"){
                        console.log('already logged in');
                        chrome.storage.local.set({logging: !result.logging}, ()=>{
                            console.log('setting logging to:', !result.logging);
                        });
                        //close checkLogin tab
                        port.postMessage({reply: "alr logged in, close tab please!"});//--------------------------------------------not done
                    } else if (msg.message === "redirect_to_login"){
                        console.log('redirecting to login page');
                        chrome.tabs.create({"url": "https://myanimelist.net/login.php?from=%2F", "active": false}, (newTab)=>{
                            chrome.storage.sync.set({loginTabId: newTab.id}, ()=>{
                                console.log('saving loginTabId', newTab.id);
                                //close checkLogin tab
                                port.postMessage({reply: "not logged in, redirecting, close tab please!"});//-----------------------same
                            });
                        });
                    };
                };
            });
        });
    } else if (port.name === "login"){
        port.onMessage.addListener((msg)=>{
            if (msg.message === "inputting_login_info"){
                chrome.storage.local.get(['username', 'password', 'logging'], (result)=>{
                    console.log("logging", result.logging)
                    if(result.logging === true){
                        console.log('sending login info')
                        let data = {
                            username: result.username,
                            password: result.password
                        };
                        chrome.storage.local.set({logging: !result.logging}, ()=>{
                            console.log('setting logging to:', !result.logging);
                        });
                        port.postMessage({reply: "login_info", data: data});
                    } else if (result.logging === false){
                        port.postMessage({reply: "abort_login"});//---------------------------------------------close login tab
                    }
                });
            };
        });
    }
});