// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
// chrome.tabs.get(2042, (tab)=>{
//     console.log(tab)
// })

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

let clearProcessed = () => {//requires that we process one at a time
    chrome.storage.sync.get(['animeTabs'], (result)=>{
        console.log("clearing animeTab");
        let animeTabs = result.animeTabs;
        //delete tab---------------------------------------------------------------------------
        chrome.tabs.remove(animeTabs[0].id);
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

chrome.runtime.onConnect.addListener((port)=>{
    //content
    if(port.name === "sync"){
        port.onMessage.addListener((msg)=>{
            //on content ready,
            if(msg.message === "check_login_info"){
                //check if user has saved data,
                chrome.storage.local.get(['username', 'password'], (result)=>{
                    console.log('local username', result.username);
                    console.log('local password', result.password);
                    //if no user data in storage, give form to get username and password
                    if(result.username === undefined || result.password === undefined){
                        console.log('need login info');
                        port.postMessage({reply: "need_login_info"});
                    //else if have user data, open checkLogin tab to check if already logged in
                    //save checkLoginTabId in sync storage
                    } else {
                        console.log('have login info!');
                        chrome.tabs.create({"url": "https://myanimelist.net/", "active": false}, (newTab)=>{
                            chrome.storage.sync.set({checkLoginTabId: newTab.id}, ()=>{
                                // console.log("tab:", newTab)
                                // console.log("saving checkLoginTab id", newTab.id);
                            });
                        });
                    };
                });
            //if content is sending user info from form, save the data
            } else if (msg.reply === "sending_login_info"){
                chrome.storage.local.set({username: msg.data.username, password: msg.data.password}, ()=>{
                    console.log('saving user info', msg.data)
                    port.postMessage({reply: "saved_login_info"});
                });
            //if user clicks on anime download link in content, open tab to anime info to sync data
            } else if (msg.message === "open_new_unfocused_tab"){
                chrome.storage.local.get(['username', 'password'], (result)=>{
                    console.log('local username', result.username);
                    console.log('local password', result.password);
                    //if user has ignored the form and clicked on download without inputting data, send warning before checking (in case they logged in manually)
                    if(result.username === undefined || result.password === undefined){
                        alert("No user info saved! Please login to MAL manually to use this extension.")//-----------clunky: option to ignore?
                        createNewTab(msg);
                    } else {
                    //if user has already input data, proceed
                        createNewTab(msg);
                    };
                });
                //message for good measure
                port.postMessage({reply: "DONE SENDING REQ TO ANIMETAB"})
            };
        })
    //animeTab
    } else if (port.name === "animeTab"){
        port.onMessage.addListener((msg)=>{
            //if user is logged in, send info to sync
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
            //second time onwards, sync episode data
            } else if (msg.reply === "changed episode info"){
                console.log('changed other info and back in background');
                toggleProcessing();
                clearProcessed();
            //first time, change to watching
            } else if (msg.reply === "added to list"){
                console.log('added to list and back in background');
                toggleProcessing();
                clearProcessed();
            //if not logged in,
            } else if (msg.message === "not_logged_in"){
                chrome.storage.sync.get(['animeTabs', 'processing'], (result)=>{
                    //but trying to process, abort
                    if(result.processing === true){
                        console.log("abort because not logged in");
                        toggleProcessing();
                        clearProcessed();
                    //and user is not trying to process (user is randomly surfing)
                    } else {
                        console.log('just chillin');
                    };
                });
            }
        });
    //checkLogin
    } else if (port.name === "checkLogin"){
        port.onMessage.addListener((msg)=>{
            //check if should login (so it doesn't activate when you go to the website directly)
            chrome.storage.local.get(['logging'], (result)=>{
                //if you want to log in,
                if(result.logging === true){
                    //but you are already logged in, change logging to false and close checkLogin tab
                    if(msg.message === "already_logged_in"){
                        console.log('already logged in');
                        chrome.storage.local.set({logging: !result.logging}, ()=>{
                            console.log('setting logging to:', !result.logging);
                        });
                        port.postMessage({reply: "alr logged in, closing tab!!"});
                        //close checkLogin tab
                        chrome.storage.sync.get(['checkLoginTabId'], (result)=>{
                            chrome.tabs.remove(result.checkLoginTabId);
                        });
                    //and you are not yet logged in, redirect to login tab and close checkLogin tab
                    } else if (msg.message === "redirect_to_login"){
                        console.log('redirecting to login page');
                        chrome.tabs.create({"url": "https://myanimelist.net/login.php?from=%2F", "active": false}, (newTab)=>{
                            //save login tab id
                            chrome.storage.sync.set({loginTabId: newTab.id}, ()=>{
                                console.log('saving loginTabId', newTab.id);
                                //close checkLogin tab
                                port.postMessage({reply: "not logged in, redirecting, closing tab!!"});
                                chrome.storage.sync.get(['checkLoginTabId'], (result)=>{
                                    chrome.tabs.remove(result.checkLoginTabId);
                                });
                            });
                        });
                    };
                };
            });
        });
    //login
    } else if (port.name === "login"){
        port.onMessage.addListener((msg)=>{
            //when login tab is ready,
            if (msg.message === "inputting_login_info"){
                chrome.storage.local.get(['username', 'password', 'logging'], (result)=>{
                    //and if you want to log in, give login tab the user info, and change logging to false ( no repeats )
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
                    //but you do not want to log in, do nothing (user may be casually surfing)
                    } else if (result.logging === false){
                        port.postMessage({reply: "abort_login"});
                    };
                });
            //if login has done input and simulate click, close login tab.
            } else if (msg.reply === "done_login"){
                //close login tab after 3s (to allow the login page time to process)
                chrome.storage.sync.get(['loginTabId'], (result)=>{
                    console.log(result)
                    console.log('getting loginTabId', result.loginTabId);
                    setTimeout(()=>{
                        console.log('removing after 3s');
                        chrome.tabs.remove(result.loginTabId);
                    }, 3000);
                });
            };
        });
    }
});