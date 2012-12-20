function Matrix( pWidth, pHeight ) {
  var alphabet = [ "a", "b", "c", "d", "e", "f" ];
  var series = [];
  var canvas = document.getElementById( 'canvas' );
  var context = canvas.getContext( '2d' );

  function Series( pLength ) {
    // start coordinates
    var x = _.random( 1, pWidth );
    var y = _.random( 1, pHeight - pLength + 1 );

    var currentLength = 0;

    this.step = function() {
      ++currentLength;
      var c = alphabet[ _.random( 0, alphabet.length - 1 ) ];
      context.fillText( c, x * 10, ( y + currentLength - 1 ) * 10 );
    }

    this.isObsolete = function() {
      return pLength === currentLength;
    }
  }

  // create a new series once in a while
  setInterval( function() {
    series.push( new Series( _.random( 5, pHeight ) ) );
  }, 5 );

  // wipe invisible series
  setInterval( function() {
    series = _.filter( series, function( s ) {
      return !s.isObsolete();
    } );
  }, 500 );

  // initialize background
  context.fillStyle = 'rgb( 0, 0, 0 )';
  context.fillRect( 0, 0, 1000, 1000 );

  // redraw
  setInterval( function() {
    context.fillStyle = 'rgba( 0, 0, 0, 0.06 )';
    context.fillRect( 0, 0, 1000, 1000 );
    context.fillStyle = 'rgb( 0, 255, 0 )';
    _.chain( series )
      .filter( function( s ) { return !s.isObsolete(); } )
      .each( function( s ) { s.step(); } );
  }, 30 );
};

new Matrix( 100, 100 );

