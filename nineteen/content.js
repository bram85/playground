var Nineteen = function() {

var MATCHLEN = 19;

function pruneTag( pElement, pTag ) {
  var elements = pElement.getElementsByTagName( pTag );
  for ( var i = elements.length - 1; i >= 0; --i ) {
    elements[ i ].parentNode.removeChild( elements[ i ] );
  }
}

function wordList( pText ) {
  // match words longer than MATCHLEN characters
  var re = new RegExp( "[a-zA-Z]{" + MATCHLEN + ",}", "g" );
  var ij = new RegExp( "ij", "gi" );

  var matches = pText.match( re );

  var result = [];
  if ( matches !== null ) {
    // handle the 'lange ij' case
    result = matches.filter( function( match ) {
      return match.replace( ij, "i" ).length === MATCHLEN;
    } ).map( function( word ) {
      return word.toLowerCase();
    } ).sort();

    // remove duplicates
    if ( result.length > 1 ) {
      for ( var i = result.length - 1; i > 0; --i ) {
        if ( result[ i ] === result[ i - 1 ] ) {
          result.splice( i, 1 );
        }
      }
    }
  }

  return result;
}

var body = document.body.cloneNode( true ); // deep

pruneTag( body, "script" );
pruneTag( body, "style" );

var words = wordList( body.textContent );

if ( words.length > 0 ) {
  chrome.extension.sendMessage( null, words );
}

}();
