/**
 * Produces n values according to the ARMA model.
 */

function arma( ar, ma, n ) {
  var result = [];

  // first values are older
  var values = [];
  var noises = [];

  for ( var i = 0; i < n; ++i ) {
    // fetch random value between -1 and 1
    var noise = 2 * Math.random() - 1;
    var value = noise;

    // process AR part
    for ( var j = 0; j < values.length; ++j ) {
      value = value + ar[ j ] * values[ values.length - j - 1 ];
    }

    // process MA part
    for ( var j = 0; j < noises.length; ++j ) {
      value = value + ma[ j ] * noises[ noises.length - j - 1 ];
    }

    values.push( value );
    if ( values.length > ar.length ) {
      values.shift();
    }

    noises.push( noise );
    if ( noises.length > ma.length ) {
      noises.shift();
    }

    result.push( value );
  }

  return result;
}

var data = arma( [1], [1], 100 );

var WIDTH = 800;
var HEIGHT = 600;
var MARGIN = 20;

y = d3.scale.linear().domain( [ d3.min( data.concat( [ 0 ] ) ), d3.max( data.concat( [ ] ) ) ] ).range( [ 0 + MARGIN, HEIGHT - MARGIN ] );
x = d3.scale.linear().domain( [ 0, 100 ] ).range( [ 0 + MARGIN, WIDTH - MARGIN ] );

var graph = d3.select( "body" )
  .append( "svg:svg" )
  .attr( "width", WIDTH )
  .attr( "height", HEIGHT );

var g = graph.append( "svg:g" )
  .attr( "transform", "translate(0,600)" );

var line = d3.svg.line()
  .x( function( d, i ) { return x( i ) } )
  .y( function( d ) { return -1 * y( d ) } );

g.append( "svg:path" ).attr( "d", line( data ) );

// x axis
g.append( "svg:line" )
  .attr( "x1", x( 0 ) )
  .attr( "y1", -1 * y( 0 ) )
  .attr( "x2", x( WIDTH ) )
  .attr( "y2", -1 * y( 0 ) );

// y axis
g.append( "svg:line" )
  .attr( "x1", x( 0 ) )
  .attr( "y1", -1 * y( d3.min( data.concat( [ 0 ] ) ) ) )
  .attr( "x2", x( 0 ) )
  .attr( "y2", -1 * y( d3.max( data.concat( [ 0 ] ) ) ) );

// x labels
g.selectAll( ".xLabel" )
  .data( x.ticks( 5 ) )
  .enter().append( "svg:text" )
  .attr( "class", "xLabel" )
  .text( String )
  .attr( "x", function( d ) { return x( d ) } )
  .attr( "y", -1 * y( -0.7 ) )
  .attr( "text-anchor", "middle" );

// y labels
g.selectAll( ".yLabel" )
  .data( y.ticks( 5 ) )
  .enter().append( "svg:text" )
  .attr( "class", "yLabel" )
  .text( String )
  .attr( "x", 5 )
  .attr( "y", function( d ) { return -1 * y( d ) } )
  .attr( "text-anchor", "middle" )
  .attr( "dy", 4 );

// x ticks
g.selectAll( ".xTicks" )
  .data( x.ticks( 5 ) )
  .enter().append( "svg:line" )
  .attr( "class", "xTicks" )
  .attr( "x1", function( d ) { return x( d ); } )
  .attr( "y1", -1 * y( 0 ) )
  .attr( "x2", function( d ) { return x( d ); } )
  .attr( "y2", -1 * y( -0.3 ) );

// y ticks
g.selectAll( ".yTicks" )
  .data( y.ticks( 4 ) )
  .enter().append( "svg:line" )
  .attr( "class", "yTicks" )
  .attr( "x1", x( 0 ) )
  .attr( "y1", function( d ) { return -1 * y( d ) } )
  .attr( "x2", x( -0.01 * 100 ) )
  .attr( "y2", function( d ) { return -1 * y( d ) } );

