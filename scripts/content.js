//This is not inserting js to popup.html
//This is inserting js in actual web Browser Html
function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);    
}

myStorage = window.sessionStorage;
var myWin = myStorage.getItem("winName");
var windowObjectReference = null;
var PreviousUrl;
function openRequestedPopup(url, windowName) {
  myWin = myStorage.getItem("winName");
  if (myWin === null) {
    if(windowObjectReference == null || windowObjectReference.closed) {
      myStorage.setItem("winName", windowName);
      windowObjectReference = window.open(url, windowName);
    } 
    else if(PreviousUrl != url) {
      //Skip
      windowObjectReference.focus();
    }
    else {
      windowObjectReference.focus();
    };
  } else {

  }
  PreviousUrl = url;
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
      }`;

    // IE8 and below.
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    // add it to the head
    head[0].appendChild(style);
    modalHTML = `<div id="readAssistModal" class="RAmodal" >
        <!-- Modal content -->
        <div class="RA-modal-content">
        <div class="RA-modal-header">
            <h4>ReadAssist<span class="readAssistClose">&times;</span></h4>
        </div>
        <div class="RA-modal-body">
            <p id="readAssistTextHere"></p>
        </div>
        </div>
        <br>
        <br>
    </div>`;
    document.getElementsByTagName('body')[0].insertAdjacentHTML("afterbegin", modalHTML);
}

myStorage = window.sessionStorage;
var myloc = myStorage.getItem("location");
if (myloc === null) {
  myStorage.setItem("location", window.location.origin);
  myloc = myStorage.getItem("location");
  //If origin same as current window, then inject
  injectScript(chrome.runtime.getURL('scripts/inject.js'), 'body');
  injectCSS('head');
} else {
  //Do nothing
  myloc = null;
}


//Gets messages from inject.js
window.onmessage = (event) => {
  if (event.data.type === "WORD_PAGE") {
    // //Opens popup in a new tab
    openRequestedPopup(chrome.runtime.getURL("popup.html"), "ReadAssist");
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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // console.log(sender.tab ?
      //     "from a content script:" + sender.tab.url :
      //     "from the extension");

      //Got synonym to be published from Background.js
      if (request.greeting === "publishSynonym") {
          const synonym = request.data;
          //Sends synonym to inject.js
          window.postMessage(JSON.stringify({
              type: "PUBLISHSYNONYM_PAGE",
              word: request.word,
              synonym: synonym
            }), "*");
      }
      else if (request.greeting === "contextInit") {
          //Sends CONTEXT INIT request msg to inject.js          
          window.postMessage({type: "CONTEXTINIT_PAGE"}, "*");
      }
      else if (request.greeting === "openReadAssist") {
        //Check if already Opened and if not, open
        openRequestedPopup(chrome.runtime.getURL("popup.html"), "ReadAssist");
      }
      return true;
    }
);
