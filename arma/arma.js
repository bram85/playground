var arma = (function() {
  var WIDTH = 800;
  var HEIGHT = 600;
  var MARGIN = 40;

  var xAxis = null;

  /**
   * Produces n values according to the ARMA model.
   */
  function generateValues( ar, ma, n ) {
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

  function update() {
    var ar = getParams( "ar" );
    var ma = getParams( "ma" );
    var n = parseInt( d3.select( "#n" ).property( "value" ), 10 );

    if ( isNaN( n ) || n <= 0 || n >= 10000 ) {
      // override
      n = 100;
    }

    var data = generateValues( ar, ma, n );
    var datazero = function() { return data.concat( [ 0 ] ); };

    y = d3.scale.linear().domain( [ d3.max( datazero() ), d3.min( datazero() ) ] ).range( [ 0 + MARGIN, HEIGHT - 2 * MARGIN ] );
    x = d3.scale.linear().domain( [ 0, n ] ).range( [ 0 + MARGIN, WIDTH - MARGIN ] );

    var g = d3.select( "#graph" );

    var line = d3.svg.line()
      .x( function( d, i ) { return x( i ); } )
      .y( function( d ) { return y( d ); } );

    d3.select( "#graph path" ).attr( "d", line( data ) );

    d3.selectAll( "#graph line, #graph text, #graph #y-axis" ).remove();
    d3.select( "#graph #x-axis" ).transition()
      .attr( "transform", "translate( 0, " + y( 0 ) + ")" )
      .each( "start", function() {
        xAxis
          .scale( x )
          .tickSize( 10 )
          .ticks( 5 );

        d3.select( this ).call( xAxis );
      } );

    // x axis
    if ( xAxis === null ) {
      xAxis = d3.svg.axis()
        .scale( x )
        .tickSize( 10 )
        .ticks( 5 )
        .orient( "bottom" );

      g.append( "svg:g" )
        .classed( "axis", 1 )
        .attr( "id", "x-axis" )
        .attr( "transform", "translate( 0," + y( 0 ) + ")" )
        .call( xAxis );
    }

    // y axis
    var yAxis = d3.svg.axis()
      .scale( y )
      .tickSize( 10 )
      .ticks( 5 )
      .orient( "left" );

    g.append( "svg:g" )
      .classed( "axis", 1 )
      .attr( "id", "y-axis" )
      .attr( "transform", "translate(" + x( 0 ) + "," + 0 + ")" )
      .call( yAxis );
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

  var onValueChanged = function() {
    var eventTimeoutHandle;

    return function() {
      var key = d3.event.which;

      if ( ( key >= 48 && key <= 57 ) || ( key >= 96 && key <= 105 ) || key == 8 || key == 190 ) {
        clearTimeout( eventTimeoutHandle );
        eventTimeoutHandle = setTimeout( update, 500 );
      } else {
        // restore the value using parseFloat
        var field = d3.select( this );
        var value = parseFloat( field.property( "value" ) );
        field.property( "value", value );
      }
    };
  }();

  d3.select( "#graphdiv" )
      .append( "svg:svg" )
      .attr( "width", WIDTH )
      .attr( "height", HEIGHT )
      .append( "svg:g" )
      .attr( "id", "graph" )
      .append( "svg:path" );

  addField( "ar", 0.5 );
  addField( "ar", 0.0 );
  addField( "ma", 0.0 );

  update();

  d3.select( "#n" ).on( "keyup", onValueChanged );
})();
