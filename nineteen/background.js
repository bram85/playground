var getActiveWords = function() {
  // a dictionary which contains all words on open tabs
  var activeWords = [];
  var allWords = {};

  chrome.tabs.onUpdated.addListener( function( pTabID, pChangeInfo, pTab ) {
    if ( pChangeInfo.status === "complete" && pTab.url.match( '^http:' ) ) {
      chrome.tabs.detectLanguage( pTabID, function( pLanguage ) {
        if ( pLanguage === "nl" ) {
          // insert content script
          chrome.tabs.executeScript( pTabID, { file: "content.js" } );
        }
      } );
    }
  } );

  function setActiveWords( pTabID ) {
    var tabID = pTabID.toString();

    if ( allWords.hasOwnProperty( tabID ) ) {
      activeWords = allWords[ tabID ];
      chrome.browserAction.setPopup( {
        tabId: pTabID,
        popup: "popup.html"
      } );
    }
  }

  chrome.extension.onMessage.addListener( function( pMessage, pSender ) {
    if ( pMessage.length > 0 ) {
      var tabID = pSender.tab.id;

      chrome.browserAction.setBadgeText( {
        text: pMessage.length.toString(),
        tabId: tabID
      } );

      allWords[ tabID.toString() ] = pMessage;
      setActiveWords( tabID );
    }
  } );

  chrome.tabs.onRemoved.addListener( function( pTabID ) {
    delete allWords[ pTabID.toString() ];
  } );

  chrome.tabs.onActivated.addListener( function( pInfo ) {
    setActiveWords( pInfo.tabId );
  } );

  return function() {
    return activeWords;
  }
}();
