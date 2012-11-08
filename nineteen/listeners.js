var words = [];

chrome.tabs.onUpdated.addListener( function( pTabID, pChangeInfo, pTab ) {
  if ( pChangeInfo.status === "complete" ) {
    chrome.tabs.detectLanguage( pTabID, function( pLanguage ) {
      if ( pLanguage === "nl" ) {
        // insert content script
        chrome.tabs.executeScript( pTabID, { file: "content.js" } );
      }
    } );
  }
} );

chrome.extension.onMessage.addListener( function( pMessage, pSender ) {
  if ( pMessage.length > 0 ) {
    var tabID = pSender.tab.id;

    chrome.browserAction.setBadgeText( {
      text: '' + pMessage.length,
      tabId: tabID
    } );

    chrome.browserAction.setPopup( {
      tabId: tabID,
      popup: "popup.html"
    } );

    words = pMessage;
  }
} );

