angular
    .module("RESS-dashboard", ['tableSort','ngDialog','ngResource'])
    .config(function($locationProvider){
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
            rewriteLinks: false
        })
    })

    .controller("EventsCtrl", function($scope, $resource,ngDialog,$location,$anchorScroll,$timeout) {
	   //set constants
	   $scope.START_DATE_LIMIT= 31; // display events with start date less than or equal to this number of days after the current date
	   //$scope.END_DATE_GRACE_DISPLAY = 3; // How long to continue to display events without them being completed;
       $scope.isLoading = false;
       // hold the list of events to render.
       $scope.events = [];
       $scope.linedata = [];
       $scope.pointdata = [];
       $scope.date = new Date().getTime();

       // check for if anchor exists
       var hash = window.location.hash.substring(1)
       //store event id for map overlay
       $scope.event_id = hash ? hash.split("_")[1] : null;
 
       //load line and point data
       loadRemoteData();

       if (hash) {
       //scroll to event
         $scope.scrollTo = function(id) {
           var old = $location.hash();
      	   $location.hash(id);
      	   $anchorScroll();
     	   $location.hash(old);
         }
       }

    // PUBLIC METHODS.
    // ---
    // Can be added to reload the table data with AJAX call (using JSONP).
    //refresh not added yet.. not a lot of events
    $scope.refresh = function() {
        loadRemoteData();
    };

    //clickToOpen powers the overlay map event popup
    $scope.clickToOpen = function (event) {
      ngDialog.open({ template: 'partials/event_map.html',
      	data: {event_id:event.attributes.OBJECTID,url:event.url,title: event.attributes.COUNTYROADNUMBER,type: event.attributes.EVENTTYPE,start: event.attributes.STARTDATE,end: event.attributes.ENDDATE},
      	closeByDocument: false,
      	closeByEscape: true
      				});
    };


    //clickToOpen powers the overlay map event popup
    $scope.clickToUpdate = function (event) {
      ngDialog.open({ template: 'partials/event_update.php',
        data: {event_id:event.attributes.OBJECTID,url:event.url,title: event.attributes.COUNTYROADNUMBER,alias: event.attributes.COUNTYROADALIAS,
          tocralias:event.attributes.TOCRALIAS,fromcralias:event.attributes.FROMCRALIAS,contactname: event.attributes.CONTACTNAME, 
          contactphone: event.attributes.CONTACTPHONE, last_edited_date: event.attributes.LAST_EDITED_DATE,type: event.attributes.EVENTTYPE,
          start: event.attributes.STARTDATE,end: event.attributes.ENDDATE,category: event.attributes.EVENTCATEGORY},
        closeByDocument: false,
        closeByEscape: true
              });
    };

    // ---
    // PRIVATE METHODS.
    // ---
    // I load the remote data.

     function getlinedata($scope) {
    	var ArcGISAPILines = $resource(
        "http://agomaps.larimer.org/arcgis/rest/services/PublicWorks/RoadAndBridgeEventConsumer/MapServer/1/query?where=OBJECTID+%3E+0&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson",
        {callback: "JSON_CALLBACK"},
        {get: {method: "JSONP"}});
    	ArcGISAPILines.get().$promise.then(
        	function( lineevents ) {
           		$scope.isLoading = false;
           		linedata = lineevents.features;
           	if (linedata) {
           	if(  document.addEventListener ){ //check to see if IE greater than IE8
           		linedata.forEach(function(event) {
           			//var event=linedata[i];
            			geo = event.geometry.paths;
            			xvalues = geo[0].map(function(elt) { return elt[0];});
            			yvalues = geo[0].map(function(elt) { return elt[1];});
						Xmax = Math.max.apply(null, xvalues);
						Ymax = Math.max.apply(null, yvalues);
						Xmin = Math.min.apply(null, xvalues);
						Ymin = Math.min.apply(null, yvalues);         		
            			minpoint = getCoordinates(Ymin,Xmin);
            			maxpoint = getCoordinates(Ymax,Xmax);
            			extent = [minpoint.lon,minpoint.lat].concat([maxpoint.lon,maxpoint.lat]).join();
            			event.url = 'http://larimercounty.maps.arcgis.com/apps/Embed/index.html?webmap=7675cf97c99e4d9590b0767be8dd18d0&extent='+extent;
                if($scope.event_id == event.attributes.OBJECTID) {
                  ngDialog.open({ template: 'partials/event_map.html',
                    data: {url:event.url,title: event.attributes.COUNTYROADNUMBER,type: event.attributes.EVENTTYPE,start: event.attributes.STARTDATE,end: event.attributes.ENDDATE},
                    closeByDocument: false,
                    closeByEscape: true
                    });
                }
            	});

            }

            	$scope.events = linedata.concat($scope.events);

            } //end of if linedata exists
        	},
            function( error ) {
           		alert( "Something went wrong with lines!" );
        	}
    	);
    }

    function getpointdata($scope) {
    	var ArcGISAPIPoints = $resource(
        	"http://agomaps.larimer.org/arcgis/rest/services/PublicWorks/RoadAndBridgeEventConsumer/MapServer/0/query?where=OBJECTID+%3E+0&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson",
        	{callback: "JSON_CALLBACK"},
        	{get: {method: "JSONP"}});
    	// Get the list of events.
        ArcGISAPIPoints.get().$promise.then(
        	function( pointevents ) {
           		$scope.isLoading = false;
           		pointdata = pointevents.features;
           	if (pointdata) {
           	if(  document.addEventListener){   //check to see if IE greater than IE8
           		pointdata.forEach(function(event) {
           			//var event=pointdata[i];
            		geo = event.geometry;
            		center = getCoordinates(geo.y,geo.x);
            		event.url = 'http://larimercounty.maps.arcgis.com/apps/Embed/index.html?webmap=7675cf97c99e4d9590b0767be8dd18d0&center='+center.lon+','+center.lat+'&level=16';
                if($scope.event_id == event.attributes.OBJECTID) {
                  ngDialog.open({ template: 'partials/event_map.html',
                    data: {url:event.url,title: event.attributes.COUNTYROADNUMBER,type: event.attributes.EVENTTYPE,start: event.attributes.STARTDATE,end: event.attributes.ENDDATE},
                    closeByDocument: false,
                    closeByEscape: true
                    });
                }
              });
           	}

           		//load point events into events
            	$scope.events = pointdata.concat($scope.events);
            } //end of if pointdata exists
        	},
            function( error ) {
           	// If something goes wrong with a JSONP request in AngularJS,
        	// the status code is always reported as a "0". As such, it's
            // a bit of black-box, programmatically speaking.
           	alert( "Something went wrong with lines!" );
        }
    	);
    }
    function loadRemoteData() {
        $scope.isLoading = true;
        getpointdata($scope);
        getlinedata($scope);
    }

    //get Coordinates built to get simi-accurate enclosure for popup maps

    function getCoordinates(y, x) {   
           
            // Coordinate System Parameters
            var a = 20925604.48;              	// major radius of ellipsoid, map units (NAD 83)
            var e = 0.08181905782;            	// eccentricity of ellipsoid (NAD 83)
            
            var angRad = 0.01745329252;      	// number of radians in a degree
            var pi4 = Math.PI / 4;    			// Pi / 4
            var p0 = 39.333333 * angRad;     	// latitude of origin
            
            var p1 = 39.716667 * angRad;    	// latitude of first standard parallel
            var p2 = 40.783333 * angRad;     	// latitude of second standard parallel
            
            var m0 = -105.5 * angRad;       	// central meridian
            var x0 = 3000000.000316;           // false easting of central meridian, map units
            var y0 = 999999.9999600;             // false northing, map units
            
            // Calculate the coordinate system values
            
            var m1 = Math.cos(p1) / Math.sqrt(1 - ((Math.pow(e, 2)) * (Math.pow(Math.sin(p1), 2))));
            var m2 = Math.cos(p2) / Math.sqrt(1 - ((Math.pow(e, 2)) * (Math.pow(Math.sin(p2), 2))));
            var t0 = Math.tan(pi4 - (p0 / 2));
            var t1 = Math.tan(pi4 - (p1 / 2));
            var t2 = Math.tan(pi4 - (p2 / 2));

            t0 = t0 / (Math.pow(((1 - (e * (Math.sin(p0)))) / (1 + (e * (Math.sin(p0))))), (e / 2)));
            t1 = t1 / (Math.pow(((1 - (e * (Math.sin(p1)))) / (1 + (e * (Math.sin(p1))))), (e / 2)));
            t2 = t2 / (Math.pow(((1 - (e * (Math.sin(p2)))) / (1 + (e * (Math.sin(p2))))), (e / 2)));
            var n = Math.log(m1 / m2) / Math.log(t1 / t2);
            var f = m1 / (n * (Math.pow(t1, n)));
            var rho0 = a * f * (Math.pow(t0, n));
            
            // Calculate the coordinate to Lat/Long
            // do the longitude...
            x = x - x0;
            y = y - y0;
            
            var pi2 = pi4 * 2;
            var rho = Math.sqrt((Math.pow(x, 2)) + (Math.pow((rho0 - y), 2)));
            var theta = Math.atan(x / (rho0 - y));
            var t = Math.pow((rho / (a * f)), (1 / n));
            var lon = (theta / n) + m0;
            x = x + x0;
            
            // Estimate the Latitude
            var lat0 = pi2 - (2 * Math.atan(t));
            
            // Substitute the estimate into the iterative calculation that
            // converges on the correct Latitude value.
            var part1 = (1 - (e * Math.sin(lat0))) / (1 + (e * Math.sin(lat0)));
            var lat1 = pi2 - (2 * Math.atan(t * (Math.pow(part1, (e / 2)))));
            
            do
            { 
                lat0 = lat1;
                part1 = (1 - (e * Math.sin(lat0))) / (1 + (e * Math.sin(lat0)));
                lat1 = pi2 - (2 * Math.atan(t * (Math.pow(part1, (e / 2)))));
            } while (Math.abs(lat1 - lat0) >= 0.000000002);
            
            // Convert from radians to degrees.
            var lat = lat1 / angRad;
            lon = lon / angRad;
            
            // Round the latitude and longitude
            lat = (lat * 100000) / 100000;
            lon = (lon * 100000) / 100000;
            
            // return object for measurement tool point calculation
           // return object for measurement tool point calculation
            var retObj = new Object;
            retObj.lat = lat.toFixed(6);
            retObj.lon = lon.toFixed(6);
            return retObj;
        }
    }).controller('SendUpdateCtrl', function ($scope, $http) {
    /*
    * This method will be called on click event update of button.
    * Here we will read the grab the hidden event details, message and post to the MailChimp API (via PHP).
    */

    $scope.eventupdate = {};
    $scope.confirmmessage = false;
        $scope.confirmForm = function() {
          $scope.confirmmessage = true;
        };
    // call to submit function
        $scope.submitForm = function() {
        // Post data to php script
        $http({
          method  : 'POST',
          url     : 'send_update.php',
          data    : $scope.eventupdate, //forms event object
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         })
         .success(function(data) {
            if (data.errors) {
              // Showing errors.
              $scope.errorMessage = data.errors.message;
            } else {
              $scope.message = data['message'];

            }
          });
        };
    })

// Filters 

    .filter('debug', function() {
        return function(input) {
            if (input === '') return 'empty string';
            return input ? input : ('' + input);
        };
    })

    .filter("sanitize", ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        }
    }])

    .filter('parseUrlFilter', function () {
        var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
        return function (text, target) {
    	   if (text) {
        	   return text.replace(urlPattern, '<a target="' + target + '" href="$&">$&</a>');
            }
            else {
        	   return text;
            } 
        };
    })

    .filter('parameterize', function () {
        return function (text) {
            var str = text.replace(/\s+/g, '-');
            return str.toLowerCase();
        };
    })

    .filter('trusted', ['$sce', function ($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
    }
    }]);
