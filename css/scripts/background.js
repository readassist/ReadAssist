function getWordSynonym(info,tab) {
    //If multiple words are selected
    allWords = info.selectionText.split(" ");
    if (allWords.length >1) {
        //TODO -Add note making code here
    } else if (allWords.length === 1) {
        setTimeout(function(){ 
            chrome.storage.sync.set({'getSynonymPhased': allWords[0]}, function() {
                //To Extension.js
            });
        }, 300);
    }   
}

function openRequestedPopup(url) {
    chrome.tabs.create({ active: false, url: url });    
}

function onClickHandler(info, tab) {
    if (info.menuItemId==="contextpage") {
        openRequestedPopup(chrome.runtime.getURL("popup.html"));
        //Send msg to Content.js
        chrome.tabs.sendMessage(tab.id, {greeting: "contextInit", tabId: "NA"}, function(response) {

        });
        chrome.storage.sync.set({'setExtensionTabId': tab.id}, function() {
            //To Extension.js for init
        });
        
        
    }
    else if (info.menuItemId === "contextselection") {     
        //Get the word synonym for selected text
        getWordSynonym(info, tab);
    }
    else {
        return true;
    }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function() {
  var contexts = ["page"]; //,"link","editable","image","video","audio"
  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "ReadAssist - Click to Enable";
    //Setup page specific contextMenu
    var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});
  }
  // Set up context menu for Selection
  var id = chrome.contextMenus.create({"title": "Get Quick Synonym: %s", "contexts":["selection"],
                                            "id": "context" + "selection"});
});

//Listener to handle removed tabs
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    //Send msg to Content.js
    chrome.tabs.sendMessage(tabId, {greeting: "clearStorage", tabId: tabId}, function(response) {
         
    });
});

var word = 'hello';
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting === "word") {
            word = request.data;
            chrome.storage.sync.set({'getSynonym': word}, function() {
                //To Extension.js
            }); 
        }
        //Got synonym for word from Extension 
        else if (request.greeting === "pushSynonym") {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                //Sending message to content.js
                chrome.tabs.sendMessage(tabs[0].id, {greeting: "publishSynonym", word: request.word, data: request.data, pronunciation: request.pronunciation}, function(response) {
                    
                });
            });
        }
        else if (request.greeting === "initTabInfo") {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                //Sending message to content.js
                chrome.tabs.sendMessage(tabs[0].id, {greeting: "initSetup", tabId: request.tabId}, function(response) {
                    
                });
            });
        }
        return true;
    }
);

  
  


