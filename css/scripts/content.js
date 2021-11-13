//This is not inserting js to popup.html
//This is inserting js in actual web Browser Html
function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);    
}

function injectCSS(tag) { 
    //Add modal related Html code
    var head = document.getElementsByTagName('head');
    
    var style = document.createElement('style');
    style.type = 'text/css';
    // create your CSS as a string
    var css = `.RAmodal {
        display: none; 
        position: fixed; 
        border-radius: 10px;
        z-index: 1; 
        padding-top: 100px; 
        left: 0;
        top: 0;
        width: 100%; 
        height: 100%; 
        overflow: auto; 
        background-color: rgb(0,0,0); 
        background-color: rgba(0,0,0,0.4); 
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
        line-height: 1.5;
      }
      .RA-modal-content {
        position: relative;
        background-color: #ddeaff;
        margin: auto;
        padding: 0;
        border: 1px solid #888;
        border-radius: 10px;
        /*border-left: 6px solid #0072b3;*/
        width: 30%;
        -webkit-animation-name: animatetop;
        -webkit-animation-duration: 0.4s;
        animation-name: animatetop;
        animation-duration: 0.4s;
      }
      @media (min-width: 600px) {
        .RAmodal {
          max-width: 100%;
        }
      }
      @-webkit-keyframes animatetop {
        from {top:-300px; opacity:0} 
        to {top:0; opacity:1}
      }
      @keyframes animatetop {
        from {top:-300px; opacity:0}
        to {top:0; opacity:1}
      }
      .readAssistClose {
        color: #0072b3;
        float: right;
        font-size: 1.6rem;
        font-weight: bold;
        padding-right: 10px;
      }
      .readAssistClose:hover,
      .readAssistClose:focus {
        color: #000;
        text-decoration: none;
        cursor: pointer;
      }
      .RA-modal-header {
        text-align: center;
        padding: 12px 3px;
        background-color: #91bbff;
        color: black;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        /*border-left: 6px solid #0072b3;*/
      }
      .RA-modal-body {
          padding: 10px 20px;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          /*border-left: 6px solid #0072b3;*/
      }
      .RA-modal-footer {
        padding: 2px 16px;
        background-color: #0072b3;
        color: black;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        /*border-left: 6px solid #0072b3;*/
      }
      /*Pronunciation Audio enable and disable */
      .icon {
        display: inline-block;
        width: 1em;
        height: 1em;
        stroke-width: 0;
        stroke: currentColor;
        fill: currentColor;
      }
      .icon-volume-high {
        width: 1.0625em;
      }
      `;

    // IE8 and below.
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    // add it to the head
    head[0].appendChild(style);
    modalHTML = `
    <div id="readAssistModal" class="RAmodal" >
        <!-- Modal content -->
        <div class="RA-modal-content">
        <div class="RA-modal-header">
            <h4>ReadAssist<span class="readAssistClose">&times;</span></h4>
        </div>
        <div class="RA-modal-body">
            <b>Pronunciation:</b><br>
            <audio controls id="readAssistPronunciationSrc" src="" type="audio/mpeg">
              Your browser does not support the <code>audio</code> element.
            </audio>
            <p id="readAssistTextHere"></p>
        </div>
        <br>
        <br>
    </div>`;
    document.getElementsByTagName('body')[0].insertAdjacentHTML("afterbegin", modalHTML);
}

//Inject css and script to web page
injectScript(chrome.runtime.getURL('scripts/inject.js'), 'body');
injectCSS('head');

//Gets messages from inject.js
window.onmessage = (event) => {
  if (event.data.type === "WORD_PAGE") {
    //Handle the word received
    word = event.data.text;
    if (word != null) {
        //Sending message to background.js
        chrome.runtime.sendMessage({greeting: 'word', data: word}, function(response) {
            //Sent message to background.js
        });           
    }     
  }
};

//DEBUG TIP: Use this console stmt below if you experience errors with onChanged
//chrome.storage.onChanged.addListener(console.log.bind(console));
var myStorage = window.localStorage;
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var tabNotFound = myStorage.getItem("tab_info") != request.tabId;

    if (request.greeting === "publishSynonym") {
        const synonym = request.data;
        const pronunciation = request.pronunciation;
        //Sends synonym to inject.js
        window.postMessage(JSON.stringify({
            type: "PUBLISHSYNONYM_PAGE",
            word: request.word,
            synonym: synonym,
            pronunciation: pronunciation
          }), "*");
    }
    else if (request.greeting === "contextInit" && tabNotFound) {
        window.postMessage(JSON.stringify({
          type: "CONTEXTINIT_PAGE"
        }), "*");
    }
    else if (request.greeting === "initSetup") {
      myStorage.setItem("tab_info",request.tabId);
      var type = myStorage.getItem("tab_info"); 
    }
    else if (request.greeting === "clearStorage") {
        //Got clear storage -tab closed by user
        var tabFound = myStorage.getItem("tab_info") === request.tabId;
        if (tabFound) {
            //Tab exists -then clear tab_info we stored
            myStorage.clear();
        }
    }
    return true;
  }
);


