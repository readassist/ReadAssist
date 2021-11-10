function getWordSynonym(info,tab) {
    //console.log("Word " + info.selectionText + " was clicked.");
    //If multiple words are selected
    allWords = info.selectionText.split(" ");
    if (allWords.length >1) {
        //TODO -Add note making code here
    } else if (allWords.length === 1) {
        setTimeout(function(){
            chrome.tabs.sendMessage(tab.id, {greeting: "openReadAssist"}, function(response) {
            //Send msg to Content.js to open ReadAssist popup
            });
        }, 300);
        setTimeout(function(){ 
            chrome.storage.sync.set({'getSynonymPhased': allWords[0]}, function() {

            });
        }, 300);
    }   
}

function onClickHandler(info, tab) {
    // console.log("item " + info.menuItemId + " was clicked");
    // console.log("info: " + JSON.stringify(info));
    // console.log("tab: " + JSON.stringify(tab));
    //Calling init
    if (info.menuItemId==="contextpage") {
        //Send msg to Content.js
        chrome.tabs.sendMessage(tab.id, {greeting: "contextInit"}, function(response) {
            //console.log("<<<Background js sent request for init");  
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
    //console.log("'" + context + "' item:" + id);
  }
  // Set up context menu for Selection
  var id = chrome.contextMenus.create({"title": "Get Quick Synonym: %s", "contexts":["selection"],
                                            "id": "context" + "selection"});
  //console.log("'" + "selection" + "' item:" + id);
});

var word = 'hello';
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting === "word") {
            word = request.data;
            chrome.storage.sync.set({'getSynonym': word}, function() {

            }); 
        }
        //Got synonym for word from Extension 
        else if (request.greeting === "pushSynonym") {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                //Sending message to content.js
                chrome.tabs.sendMessage(tabs[0].id, {greeting: "publishSynonym", word: request.word, data: request.data}, function(response) {
                    
                });
            });
        }
        return true;
    }
);







  
  


