var arma = (function() {
  var WIDTH = 800;
  var HEIGHT = 600;
  var LEFTMARGIN = 70;
  var MARGIN = 20;

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

  var update = function() {
    var xAxis = null;
    var yAxis = null;

    return function() {
      var ar = getParams( "ar" );
      var ma = getParams( "ma" );
      var n = parseInt( d3.select( "#n" ).property( "value" ), 10 );

      if ( isNaN( n ) || n <= 0 || n >= 10000 ) {
        // override
        n = 100;
      }

      var data = generateValues( ar, ma, n );
      var datazero = data.concat( [ 0 ] );

      var min = d3.min( datazero );
      var max = d3.max( datazero );

      y = d3.scale.linear().domain( [ max, min ] ).range( [ 0 + MARGIN, HEIGHT - 2 * MARGIN ] );
      x = d3.scale.linear().domain( [ 0, n ] ).range( [ 0 + LEFTMARGIN, WIDTH - MARGIN ] );

      var setAxes = function() {
        xAxis.scale( x ).tickSize( 10 ).ticks( 5 ).orient( "bottom" );
        yAxis.scale( y ).tickSize( 10 ).ticks( 5 ).orient( "left" );

        if ( min < -1000000 || max > 1000000 ) {
          yAxis.tickFormat( d3.format( "2.1e" ) ); // exponential notation
        } else {
          yAxis.tickFormat( null ); // default format
        }
      };

      d3.select( "#x-axis" ).transition()
        .attr( "transform", "translate( 0, " + y( 0 ) + ")" )
        .each( "start", function() {
          setAxes();
          d3.select( this ).call( xAxis );
        } );

      d3.select( "#y-axis" ).transition()
        .attr( "transform", "translate(" + x( 0 ) + ",0)" )
        .each( "start", function() {
          setAxes();
          d3.select( this ).call( yAxis );
        } );

      var g = d3.select( "#graph" );

      // axes and initial plot
      if ( xAxis === null ) {
        xAxis = d3.svg.axis();
        yAxis = d3.svg.axis();

        setAxes();

        g.append( "svg:path" )
          .attr( "id", "plot" );

        g.append( "svg:g" )
          .classed( "axis", 1 )
          .attr( "id", "x-axis" )
          .attr( "transform", "translate( 0," + y( 0 ) + ")" )
          .call( xAxis );

        g.append( "svg:g" )
          .classed( "axis", 1 )
          .attr( "id", "y-axis" )
          .attr( "transform", "translate(" + x( 0 ) + "," + 0 + ")" )
          .call( yAxis );
      }

      // draw plot
      var line = d3.svg.line()
        .x( function( d, i ) { return x( i ); } )
        .y( function( d ) { return y( d ); } );

      d3.selectAll( "#plot" )
        .transition()
        .attr( "d", line( data ) )
        .duration( 500 )
        .ease( "cubic-out" );
    };
  }();

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

  var addField = function() {
    var numAR = 0;
    var numMA = 0;

    return function( type, defaultValue ) {
      if ( defaultValue == undefined ) {
        defaultValue = 0.0;
      }

      // see if a new row has to be added
      if ( ( type === "ar" && numAR >= numMA ) || ( type === "ma" && numMA >= numAR ) ) {
        var row = d3.select( "#params > tbody" ).append( "tr" );
        row.append( "td" );
        row.append( "td" );
      }

      var cell = null;

      // compose a base selector
      var base = "#params tr:nth-of-type(%1) td:nth-of-type(%2)";
      base = base.replace( /%2/, type === "ar" ? 1 : 2 );

      // lookup cell
      // note that 4 below is the offset (there are already 3 rows in the table).
      if ( type === "ar" ) {
        if ( numAR > 0 ) {
          // unregister event for last input
          d3.select( base.replace( /%1/, numAR + 3 ) + " > input" ).on( "keyup.last", null );
        }
        cell = d3.select( base.replace( /%1/, numAR + 4 ) );
        numAR++;
        cell.text( numAR + '. ' );
      } else {
        if ( numMA > 0 ) {
          // unregister event for last input
          d3.select( base.replace( /%1/, numMA + 3 ) + " > input" ).on( "keyup.last", null );
        }
        cell = d3.select( base.replace( /%1/, numMA + 4 ) );
        numMA++;
        cell.text( numMA + '. ' );
      }

      cell.append( "input" )
        .classed( "param " + type + "input", 1 )
        .property( "value", defaultValue )
        .on( "keyup.last", function() {
          addField( type, 0.0 );
        } )
        .on( "keyup", onValueChanged );
    };
  }();

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
      .append( "svg:path" )
      .attr( "id", "plot" );

  addField( "ar", 0.5 );
  addField( "ar", 0.0 );
  addField( "ma", 0.0 );

  update();

  d3.select( "#n" ).on( "keyup", onValueChanged );
})();
