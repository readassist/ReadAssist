function getFullWord(event) {
    var i, begin, end, range, textNode, offset;
   
   // Internet Explorer
   if (document.body.createTextRange) {
      try {
        range = document.body.createTextRange();
        range.moveToPoint(event.clientX, event.clientY);
        range.select();
        range = getTextRangeBoundaryPosition(range, true);
     
        textNode = range.node;
        offset = range.offset;
      } catch(e) {
        return ""; // Sigh, IE
      }
   }
   
   // Firefox, Safari
   // REF: https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint
   else if (document.caretPositionFromPoint) {
     range = document.caretPositionFromPoint(event.clientX, event.clientY);
     textNode = range.offsetNode;
     offset = range.offset;

     // Chrome
     // REF: https://developer.mozilla.org/en-US/docs/Web/API/document/caretRangeFromPoint
   } else if (document.caretRangeFromPoint) {
     range = document.caretRangeFromPoint(event.clientX, event.clientY);
     textNode = range.startContainer;
     offset = range.startOffset;
   }

   // Only act on text nodes
   if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
     return "";
   }

   var data = textNode.textContent;

   // Sometimes the offset can be at the 'length' of the data.
   // It might be a bug with this 'experimental' feature
   // Compensate for this below
   if (offset >= data.length) {
     offset = data.length - 1;
   }

   // Ignore the cursor on spaces - these aren't words
   if (isW(data[offset])) {
     return "";
   }

   // Scan behind the current character until whitespace is found, or beginning
   i = begin = end = offset;
   while (i > 0 && !isW(data[i - 1])) {
     i--;
   }
   begin = i;

   // Scan ahead of the current character until whitespace is found, or end
   i = offset;
   while (i < data.length - 1 && !isW(data[i + 1])) {
     i++;
   }
   end = i;

   // This is our temporary word
   var word = data.substring(begin, end + 1);

   // If at a node boundary, cross over and see what 
   // the next word is and check if this should be added to our temp word
   if (end === data.length - 1 || begin === 0) {

     var nextNode = getNextNode(textNode);
     var prevNode = getPrevNode(textNode);

     // Get the next node text
     if (end == data.length - 1 && nextNode) {
       var nextText = nextNode.textContent;

       // Add the letters from the next text block until a whitespace, or end
       i = 0;
       while (i < nextText.length && !isW(nextText[i])) {
         word += nextText[i++];
       }

     } else if (begin === 0 && prevNode) {
       // Get the previous node text
       var prevText = prevNode.textContent;

       // Add the letters from the next text block until a whitespace, or end
       i = prevText.length -   1;
       while (i >= 0 && !isW(prevText[i])) {
         word = prevText[i--] + word;
       }
     }
   }
   return word;
 }

 // Whitespace checker
  function isW(s) {
    return /[ \f\n\r\t\v\u00A0\u2028\u2029]/.test(s);
  }

// Try to find the next adjacent node
function getNextNode(node) {
  var n = null;
  // Does this node have a sibling?
  if (node.nextSibling) {
    n = node.nextSibling;

    // Doe this node's container have a sibling?
  } else if (node.parentNode && node.parentNode.nextSibling) {
    n = node.parentNode.nextSibling;
  }
  return n;
}

// Try to find the prev adjacent node
function getPrevNode(node) {
  var n = null;

  // Does this node have a sibling?
  if (node.previousSibling) {
    n = node.previousSibling;

    // Doe this node's container have a sibling?
  } else if (node.parentNode && node.parentNode.previousSibling) {
    n = node.parentNode.previousSibling;
  }
  return n;
}

function getChildIndex(node) {
  var i = 0;
  while( (node = node.previousSibling) ) {
    i++;
  }
  return i;
}

// All this code just to make this work with IE, OTL
function getTextRangeBoundaryPosition(textRange, isStart) {
  var workingRange = textRange.duplicate();
  workingRange.collapse(isStart);
  var containerElement = workingRange.parentElement();
  var workingNode = document.createElement("span");
  var comparison, workingComparisonType = isStart ?
    "StartToStart" : "StartToEnd";

  var boundaryPosition, boundaryNode;

  // Move the working range through the container's children, starting at
  // the end and working backwards, until the working range reaches or goes
  // past the boundary we're interested in
  do {
    containerElement.insertBefore(workingNode, workingNode.previousSibling);
    workingRange.moveToElementText(workingNode);
  } while ( (comparison = workingRange.compareEndPoints(
    workingComparisonType, textRange)) > 0 && workingNode.previousSibling);

  // We've now reached or gone past the boundary of the text range we're
  // interested in so have identified the node we want
  boundaryNode = workingNode.nextSibling;
  if (comparison == -1 && boundaryNode) {
    // This must be a data node (text, comment, cdata) since we've overshot.
    // The working range is collapsed at the start of the node containing
    // the text range's boundary, so we move the end of the working range
    // to the boundary point and measure the length of its text to get
    // the boundary's offset within the node
    workingRange.setEndPoint(isStart ? "EndToStart" : "EndToEnd", textRange);

    boundaryPosition = {
      node: boundaryNode,
      offset: workingRange.text.length
    };
  } else {
    // We've hit the boundary exactly, so this must be an element
    boundaryPosition = {
      node: containerElement,
      offset: getChildIndex(workingNode)
    };
  }

  // Clean up
  workingNode.parentNode.removeChild(workingNode);
  return boundaryPosition;
}

var myEvent;
var currentURL;
var word;
function init() {
  const p_array = document.querySelectorAll('p,h1,h2,h3,h4,h5,h6');
  const count = p_array.length;
  //loop through a list of elements.
  for (let i = 0; i < count; i++) {
    const p = p_array[i];
    //Add listener for various elements users may click
    p.addEventListener("click", function(e) {
      //TIP: Use e.target for any actions after click
      myEvent = e;
      var word1 = getFullWord(e);
      //Capture only alphanumeric word 
      word = word1.replace(/.*?(\w+).*/g, "$1");
      //This sends message from inject.js to content.js
      window.postMessage({ type: "WORD_PAGE", text: word}, "*");
    });
  }
  return true;
};

window.onmessage = (event) => {
  //Got CONTEXTINIT request from content.js
  var data = JSON.parse(event.data);
  if (data.type === "CONTEXTINIT_PAGE") {
    //Call init function since user initiated Context Menu Init here
    init();     
  } 
  else if (data.type === "PUBLISHSYNONYM_PAGE") { ////Get msg from content.js with synonym
    //Handle the word received
    const synonym = data.synonym;
    const wword = data.word;
    const pronunciation = data.pronunciation;
    if (synonym != null) {
      handleModalDisplay(synonym, wword, pronunciation);
    }   
    else {
      handleModalDisplay("ERR: WORD SYNONYM/DEFINITION NOT FOUND", wword);
    }  
  } 
};

function handleModalDisplay(synonym, word, pronunciation) {
  const pronounce = "https:"+pronunciation.trim();
  var modalText = document.getElementById("readAssistTextHere");
  modalText.innerHTML = '<strong>Word: </strong>'+word+'<br><br>'+'<strong>Synonym: </strong><br>'+synonym;
  // Get the modal
  var modal = document.getElementById("readAssistModal");
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("readAssistClose")[0];
  // When the user clicks the button, open the modal 
  modal.style.display = "block";
  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  //Set Pronunciation src for audio --######## TBD
  document.getElementById("readAssistPronunciationSrc").setAttribute("src", pronounce);
}





