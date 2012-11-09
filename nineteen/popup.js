var words = chrome.extension.getBackgroundPage().getActiveWords();

var list = document.createElement( "ul" );

words.forEach( function( word ) {
  var li = document.createElement( "li" );
  li.textContent = word;
  list.appendChild( li );
} );

document.body.appendChild( list );
