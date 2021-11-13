let counter = 0;
let ccounter = 0;
let clickedStop = false;
//Use this console stmt below if you experience errors with onChanged
// chrome.storage.onChanged.addListener(console.log.bind(console));

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];
    var word = storageChange.newValue;
    if (word != null && key === 'getSynonym' && clickedStop===false) {
        //Enable radio button by default
        const radiobtn = document.getElementById("start-assist");
        radiobtn.checked = true;
        var url = "https://api.dictionaryapi.dev/api/v2/entries/en/" +
                            encodeURIComponent(word);
        //Fetch synonym
        fetch(url)
        .then(response => {
          //Response has json content for word fetched
          response.json().then(function(data) {
            //Get all parts of speech
            var synonym = null;
            //Get Pronunciation
            var phonetics = data[0].phonetics[0].audio;
            //Loop through all parts of Speech sysnonyms or definitions available for word
            var meaning = data[0].meanings;
            for (let ps=0; ps<meaning.length; ps++) {
              //Gets partsOfSpeech -like noun, verb, etc for word
              var poSpeech = data[0].meanings[ps].partOfSpeech;
              var slen = (data[0].meanings[0].definitions[0].synonyms.length % 3) + 2;
              var temp = data[0].meanings[ps].definitions[0].synonyms.slice(0,slen).join(', ');
              if (temp.length === 0) {
                //Get definition if synonym is null
                temp = data[0].meanings[ps].definitions[0].definition;
              }
              if (synonym === null) {
                synonym = poSpeech+': '+temp;
              } else {
                synonym = synonym+'<br> '+poSpeech+': '+temp; 
              }
            }
            //Update the popup page wordsClicked
            var wordList = document.getElementById("wordList");
            // wordList append HTML
            ++counter;
            wordList.innerHTML += '<tr><td>'+word+'</td><td>'+synonym+'</td></tr>';
            if(synonym.length>0) {
              //Update the popup page wordsClicked
              var wordInsert = document.getElementById("wordsClicked");
              if (wordInsert.innerHTML.length > 24)
                wordInsert.innerHTML += ', '+word;
              else
                wordInsert.innerHTML = '<strong>Words: </strong>'+word; //First word
            }
            //Send synonym
            chrome.runtime.sendMessage({greeting: 'pushSynonym', word: word, data: synonym, pronunciation: phonetics}, function(response) {
              //Sent message to background.js
            }); 
          });
        })
    }  
    else if (word != null && key === 'getSynonymPhased' && clickedStop===false) {
      //Enable radio button by default
      const radiobtn = document.getElementById("start-assist");
      radiobtn.checked = true;
      var url = "https://api.dictionaryapi.dev/api/v2/entries/en/" +
                          encodeURIComponent(word);
      //Fetch synonym
      fetch(url)
      .then(response => {
          //Response has json content for word fetched
          response.json().then(function(data) {
            var ssynonym = null;
            //Get Pronunciation
            var phonetics = data[0].phonetics[0].audio;
            //Get all parts of speech
            //Loop through all parts of Speech sysnonyms or definitions available for word
            var meaning = data[0].meanings;
            for (let ps=0; ps<meaning.length; ps++) {
              //Gets partsOfSpeech -like noun, verb, etc for word
              var poSpeech = data[0].meanings[ps].partOfSpeech;
              var slen = (data[0].meanings[0].definitions[0].synonyms.length % 3) + 2;
              var temp = data[0].meanings[ps].definitions[0].synonyms.slice(0,slen);
              if (temp.length === 0) {
                //Get definition if synonym is null
                temp = data[0].meanings[ps].definitions[0].definition;
              }
              if (ssynonym === null) {
                ssynonym = poSpeech+': '+temp;
              } else {
                ssynonym = ssynonym+'<br> '+poSpeech+': '+temp; 
              }
            }
            //Update the popup page wordsClicked
            var wordList = document.getElementById("wordList");
            // wordList append HTML
            ++counter;
            wordList.innerHTML += '<tr><td>'+word+'</td><td>'+ssynonym+'</td></tr>';
            if(ssynonym.length>0) {
              //Update the popup page wordsClicked
              var wordInsert = document.getElementById("wordsClicked");
              if (wordInsert.innerHTML.length > 24)
                wordInsert.innerHTML += ', '+word;
              else
                wordInsert.innerHTML = '<strong>Words: </strong>'+word; //First word
            }
            //Send synonym
            chrome.runtime.sendMessage({greeting: 'pushSynonym', word: word, data: ssynonym, pronunciation: phonetics}, function(response) {
              //Sent message to background.js
            }); 
          });
      })
    } 
    else if (key === 'setExtensionTabId' && clickedStop===false) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //Sending message to Background.js
        chrome.runtime.sendMessage({greeting: 'initTabInfo', tabId: tabs[0].id}, function(response) {
          //Sent message to background.js
        }); 
      });
    }
  }
});

document.onclick = function(e) { 
  //Check if element is radio and start
  if(Object.is(e.target, document.getElementById('start-assist'))) {
    const radiobtn = document.getElementById("start-assist");
    radiobtn.checked = true;
    clickedStop = false;
  } else if(Object.is(e.target, document.getElementById('stop-assist'))) {
    const radiobtn = document.getElementById("stop-assist");
    radiobtn.checked = true;
    clickedStop = true;
  }
  //DEBUG
  //chrome.storage.onChanged.addListener(console.log.bind(console));
};




