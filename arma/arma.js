var WIDTH = 800;
var HEIGHT = 600;
var MARGIN = 20;

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
    for ( j = 0; j < noises.length; ++j ) {
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

function update( ar, ma, n ) {
  var data = arma( ar, ma, n );
  var datazero = function() { return data.concat( [ 0 ] ); };

  y = d3.scale.linear().domain( [ d3.max( datazero() ), d3.min( datazero() ) ] ).range( [ 0 + MARGIN, HEIGHT - 2 * MARGIN ] );
  x = d3.scale.linear().domain( [ 0, n ] ).range( [ 0 + MARGIN, WIDTH - MARGIN ] );

  var g = d3.select( "#graph" );

  var line = d3.svg.line()
    .x( function( d, i ) { return x( i ); } )
    .y( function( d ) { return y( d ); } );

  d3.select( "#graph path" ).attr( "d", line( data ) );

  d3.selectAll( "#graph line, #graph text, #graph .axis" ).remove();

  var xAxis = d3.svg.axis()
    .scale( x )
    .tickSize( 10 )
    .ticks( 5 )
    .orient( "bottom" );

  // y axis
  var yAxis = d3.svg.axis()
    .scale( y )
    .tickSize( 10 )
    .ticks( 5 )
    .orient( "left" );

  // x axis
  g.append( "svg:g" )
    .classed( "axis", 1 )
    .attr( "transform", "translate( 0," + y( 0 ) + ")" )
    .call( xAxis );

  g.append( "svg:g" )
    .classed( "axis", 1 )
    .attr( "transform", "translate(" + x( 0 ) + "," + 0 + ")" )
    .call( yAxis );
}

function initGraph() {
  var graph = d3.select( "#graphdiv" )
    .append( "svg:svg" )
    .attr( "width", WIDTH )
    .attr( "height", HEIGHT )
    .append( "svg:g" )
    .attr( "id", "graph" )
    .append( "svg:path" );
}

function getParams( type ) {
  var values = [];

  if ( type === "ar" || type === "ma" ) {
    d3.selectAll( "." + type + "input" ).each( function( d, i ) {
      var value = parseFloat( d3.select( this ).property( "value" ) );

      if ( !isNaN( value ) ) {
        values.push( value );
      }
    } );
  }

  return values;
}

function addField( type, defaultValue ) {
  if ( type === "ar" || type === "ma" ) {
    var list = d3.select( "ol#" + type + "block" );

    if ( defaultValue == undefined ) {
      defaultValue = 0.0;
    }

    // unregister event for the last input field
    list.selectAll( "li:last-child > input" ).on( "keyup.last", null );

    // insert new input to the list
    list
      .append( "li" )
      .append( "input" )
      .property( "value", defaultValue )
      .attr( "type", "input" )
      .classed( "param " + type + "input", 1 )
      .on( "keyup.last", function() {
        addField( type, 0.0 );
      } )
      .on( "keyup", onValueChanged );
  }
}

function onValueChanged() {
  var n = parseInt( d3.select( "#n" ).property( "value" ), 10 );

  if ( isNaN( n ) || n <= 0 || n >= 10000 ) {
    // override
    n = 100;
  }

  update( getParams( "ar" ), getParams( "ma" ), n );
}

initGraph();

addField( "ar", 0.5 );
addField( "ar", 0.0 );
addField( "ma", 0.0 );

update( [ 0.5 ], [ 0 ], 100 );

d3.select( "#n" ).on( "keyup", onValueChanged );
