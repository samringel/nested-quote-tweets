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

  for (var i = 0; i < x.length; i++) {
    //determines whether appendTweet() has already been run
    if (x[i].getElementsByClassName('nested').length ==0) {

      //loads quote tweet
      var http = new XMLHttpRequest();
      http.responseType = 'document';
      var currentTweet = x[i];
      http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

          //determines whether quote tweet is nested
          var quoteTweets = this.responseXML.getElementsByClassName('QuoteTweet');
          var unavailable = this.responseXML.getElementsByClassName('QuoteTweet--unavailable');
          if (quoteTweets.length > 0 || unavailable.length>0) {

            //determines whether there is a link to nested tweet
            var links = currentTweet.getElementsByClassName('twitter-timeline-link');
            for (var j = 0; j < links.length; j++) {
              var destination = links[j].getElementsByClassName('js-display-url');
              if (destination.length > 0 && destination[0].innerHTML.substring(0,12) === 'twitter.com/') {

                //removes link to nested tweet
                links[0].parentNode.removeChild(links[0]);
                break;
              }
            }

            //appends 'show nested tweet' button
            var element = document.createElement("div");
            element.className='nested show-nested';
            var text = document.createElement("a");
            if (quoteTweets.length > 0)
              text.onclick = function(){showNestedTweet(element, quoteTweets[0])};
            else
              text.onclick = function(){showNestedTweet(element, unavailable[0])};
            text.appendChild(document.createTextNode("Show nested tweet"));
            element.appendChild(text);
            currentTweet.parentNode.insertBefore(element, currentTweet.nextSibling);
          }
        }
      };
      http.open('GET', x[i].getElementsByClassName('QuoteTweet-link')[0].getAttribute('href'));
      http.send();
    }
  }
}

/**
  Shows the nested tweet
*/
function showNestedTweet(element, quoteTweet) {
  //removes 'show nested tweet' button
  element.removeChild(element.lastChild);
  element.className = 'nested';

  //appends nested quote tweet
  quoteTweet.className += " nestedQuoteTweet";
  element.appendChild(quoteTweet);
}