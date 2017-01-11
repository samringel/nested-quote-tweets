/*
  Nested-quote-tweets chrome extension
  By Sam Ringel
*/

appendTweets(document);

//runs appendTweets on all new html
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function(mutation) {
    for (var i = 0; i < mutation.addedNodes.length; i++) {
      if (mutation.addedNodes[i].nodeType == 1) {
        appendTweets(mutation.addedNodes[i]);
      }
    }
  })
});

observer.observe(document.body, {childList: true, subtree: true});

/**
  Identifies nested quote tweets in a html tree stemming from {node (element)}
  and adds 'show nested tweet' button to each
*/
function appendTweets(node){
  var x = node.getElementsByClassName("QuoteTweet-container");

  for (var i=0; i<x.length; i++) {
    //determines whether appendTweet() has already been run
    if (x[i].getElementsByClassName('nested').length ==0) {

      //determines whether quote tweet is nested
      var links = x[i].getElementsByClassName('twitter-timeline-link');
      if (links.length > 0) {
        var destination = links[0].getElementsByClassName('js-display-url');
        if (destination.length > 0 && destination[0].innerHTML.substring(0,12) === 'twitter.com/') {

          //removes link to nested tweet
          links[0].parentNode.removeChild(links[0]);

          //appends 'show nested tweet' button
          var element = document.createElement("div");
          element.className='nested show-nested';
          var text = document.createElement("a");
          var href = x[i].getElementsByClassName('QuoteTweet-link')[0].getAttribute('href');
          text.onclick = function(){getNestedTweet(this.parentNode, href)};
          text.appendChild(document.createTextNode("Show nested tweet"));
          element.appendChild(text);
          x[i].parentNode.insertBefore(element, x[i].nextSibling);
        }
      }
    }
  }
}

/**
  Retrieves quoted tweet from {destination (link)}
  and makes it {element (element)}'s sole child
*/
function getNestedTweet(element, destination) {
  //removes 'show nested tweet' button
  element.removeChild(element.lastChild);
  element.className = 'nested';

  //creates http request to recieve tweet
  var http = new XMLHttpRequest();
  http.responseType = 'document';
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      //identifies quote tweet
      var quoteTweets = this.responseXML.getElementsByClassName('QuoteTweet');
      if (quoteTweets.length > 0) {

        //adds nested quote tweet to page
        element.appendChild(quoteTweets[0]);
      } else {

        //if no quote tweet found, show error'
        var text = document.createElement("p");
        text.appendChild(document.createTextNode("Error accessing tweet"));
        element.appendChild(text);
        element.className = 'nested show-nested';
      }
    }
  };
  http.open('GET', destination);
  http.send();
}