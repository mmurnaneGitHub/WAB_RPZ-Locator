//NOTES:  
//QC Tests:
//MULTIPLE POLYGONS (Calico) - 8945001992
//RPZ
//Parcel 2033250060 - eligible to obtain a parking permit for a Residential Parking Zone (future test - RPZ)
//Parcel 2033250030 - Residential Parking zone is either in the process of being proposed or is already existing (future test)
//No existing RPZ found (Green) - Parcel 2033250010
//PTAG Regulated (Gray) - 7735000040
//Not Eligible (Red-brown) - 2009090013

define([
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/tasks/BufferParameters",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
        "esri/SpatialReference",
        "esri/tasks/GeometryService", 
        "dojo/_base/array", 
        "dijit/form/Button",
        "dojo/dom",
        "dojo/_base/Color",
            'dojo/dnd/Moveable',  //start moveable info window
            'dojo/query',
            'dojo/on',
            'dojo/dom-style',
            'dojo/dom-class'

], function (
          SimpleLineSymbol,
          SimpleFillSymbol,
          BufferParameters,
          Query, QueryTask, SpatialReference,    
          GeometryService, 
          arrayUtils, 
          Button,  
          dom,
          Color,  
            Moveable,
            dQuery,
            on,
            domStyle,
            domClass

  ) {

        //Begin Setup - put into config file eventually
        clickIdentify = true;  //Toggle to false when using other click widgets (measure) 
        var map;
        var address = ""; //Current address
        var r = "";   // Retrieving report...

        //Contact information
        var contactInfo = "<div style='clear:both;'><p><b>Feedback and Comments</b> <br>(253) 591-5371 <br> </p></div>";  
        var closeButton = "";  //update depending on popup type (mobile vs desktop)
        var mobileSpacer = "<div style='width:100%; height:10px; padding-bottom:15px;'>&nbsp;</div>";   //blank space to cover up scrolled over text (doesn't cover 100%!!!)
        var candidate_location;  //current candidate location geometry  - location variable for both ESRI geocode and address match location
        //------------------------------------------------------------------------

        //Geometry Service - used to perform the buffer
        //gsvc = new esri.tasks.GeometryService("https://wspdsmap.cityoftacoma.org/arcgis/rest/services/Utilities/Geometry/GeometryServer");
        //gsvc = new esri.tasks.GeometryService("http://geobase-dbnewer/arcgis/rest/services/Utilities/Geometry/GeometryServer");
        gsvc = new esri.tasks.GeometryService("https://gis.cityoftacoma.org/arcgis/rest/services/Utilities/Geometry/GeometryServer");

        //Current Parcel
        currentParcel="";

        //Buffer parcel parameters for RPP Zones query
        paramsBuffer = new BufferParameters();
        paramsBuffer.distances = [ -2 ];  //inside buffer   - fix for narrow parcels like 5003642450
        paramsBuffer.bufferSpatialReference = new esri.SpatialReference({wkid: 102100});
        paramsBuffer.unit = esri.tasks.GeometryService["UNIT_FOOT"];

       //Buffer parcel parameters for RPZ Nearby query
        paramsBuffer_RPZ = new BufferParameters();
        paramsBuffer_RPZ.distances = [ 50 ];  //outside buffer
        paramsBuffer_RPZ.bufferSpatialReference = new esri.SpatialReference({wkid: 102100});
        paramsBuffer_RPZ.unit = esri.tasks.GeometryService["UNIT_FOOT"];

        //Query layer - parcel (base)
        var qtparcel = new QueryTask("https://gis.cityoftacoma.org/arcgis/rest/services/PDS/DARTparcels_PUBLIC/MapServer/3");
        //var qtparcel = new QueryTask("https://wspdsmap.cityoftacoma.org/arcgis/rest/services/TP_Public/DARTparcels/MapServer/3");
        var qparcel = new Query();
        
        //Query layer - RPP  
        var qtRPP = new QueryTask("https://gis.cityoftacoma.org/arcgis/rest/services/PW/RPP/MapServer/1");
        //var qtRPP = new QueryTask("https://wspdsmap.cityoftacoma.org/arcgis/rest/services/PW/RPP/MapServer/1");
        //var qtRPP = new QueryTask("http://geobase-dbnewer/arcgis/rest/services/PW/RPP/MapServer/1");
        var qRPP = new Query();
            qparcel.returnGeometry = qRPP.returnGeometry = true;
            qparcel.outFields = qRPP.outFields = ["*"];  //return all fields

        //Query layer - RPZ  
        var qtRPZ = new QueryTask("https://gis.cityoftacoma.org/arcgis/rest/services/PW/RPP/MapServer/0");
        //var qtRPZ = new QueryTask("https://wspdsmap.cityoftacoma.org/arcgis/rest/services/PW/RPP/MapServer/0");
        //var qtRPZ = new QueryTask("http://geobase-dbnewer/arcgis/rest/services/PW/RPP/MapServer/0");
        var qRPZ = new Query();
            qRPZ.returnGeometry = true;

        //Parcel symbol
          var symbolParcel = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_NULL,
            new SimpleLineSymbol(
              SimpleLineSymbol.STYLE_SOLID,
              new Color([255,0,0]), 
              2
            ),new Color([255,255,0,0.25])
          );
          //This sample requires a proxy page to handle communications with the ArcGIS Server services. You will need to
          //replace the url below with the location of a proxy on your machine. See the 'Using the proxy page' help topic
          //for details on setting up a proxy page.
          esri.config.defaults.io.proxyUrl = "/website/labels/proxy.ashx";
          esri.config.defaults.io.alwaysUseProxy = false;

        //END Setup------------------------------------------------------------------------------------------------------------------

      var mjm_ClickReportFunctions = {

       newReport: function(currentMap, mapClick, SR) {
        map = currentMap;  //update map & close button
        candidate_location = mapClick; //reset for popup window 
        paramsBuffer.outSpatialReference = SR; //Update SR 
        paramsBuffer_RPZ.outSpatialReference = SR; //Update SR 

        //Make map's infoWindow draggable/moveable if not a mobile popup -----------------------------------------
        //(https://jsfiddle.net/gavinr/cu8wL3b0/light/)

          //Determine if desktop or mobile popup being used
          if (map.infoWindow.domNode.className != "esriPopupMobile") {
            closeButton = "<div style='float:right;'><button dojoType='dijit/form/Button' type='button' onClick=\"document.getElementsByClassName('titleButton close')[0].click();\"><b>Close</b></button><br>&nbsp;</div>";
            var handle = dQuery(".title", map.infoWindow.domNode)[0];
            var dnd = new Moveable(map.infoWindow.domNode, {
                handle: handle
            });

              //When infoWindow moved, hide pointer arrow:
              on(dnd, 'FirstMove', function() {
                  // hide pointer and outerpointer (used depending on where the pointer is shown)
                  theNodes = [".outerPointer", ".pointer"];
                  arrayUtils.forEach(theNodes, function(theNode) {
                    var arrowNode =  dQuery(theNode, map.infoWindow.domNode)[0];
                       if (domStyle.get(arrowNode, "display") === "block") {
                        domStyle.set(arrowNode, "display", "none");  
                           //Reset infoWindow (put back pointer) when closed
                          var closeReset = dQuery(".titleButton.close", map.infoWindow.domNode)[0];
                            on(closeReset, 'click', function() {
                                     domStyle.set(arrowNode, "display", "");  //reset - blank will let it rebuild correctly on next open
                             }.bind(this));
                       };
                 });

              }.bind(this));
            } else {
              //Mobile popup
              closeButton = ""; //Don't use close button
              if (dQuery(".titleButton.arrow.hidden", map.infoWindow.domNode)[0] !== undefined) {
                //https://dojotoolkit.org/reference-guide/1.7/dojo/replaceClass.html
                domClass.replace(dQuery(".titleButton.arrow.hidden", map.infoWindow.domNode)[0], "", "hidden");  //Update mobile popup node class removing 'hidden'
              }
            } //end mobile popup check
       //---------------------------------------------------------------------------------------------------
        
	        if (clickIdentify){
	          //Only do if other click widgets (measure) are not being used
	          this.executeQueries(mapClick);  //need to be consistent with geocoders (sends map point)  
	        }
        },

        executeQueries: function(e) {
          this.cleanUp();
          qparcel.geometry = e;  // use the map click, geocode, or device location for the query geometry
          qtparcel.execute(qparcel, this.handleQueryParcel);  //query for a parcel at location
        },

        cleanUp: function() {
          map.graphics.clear(); //remove all graphics - buffer and points
          if (map.infoWindow.isShowing) {
           map.infoWindow.hide(); //Close existing popups
          }
        },
        
        handleQueryParcel: function(results) {
          currentParcel = "";  //clear out previous results
          parcel = results.features;
            //Parcel info 
            if (parcel.length>0) {
              //Parcel found - update address/parcel info
              var title = "Tacoma Residential Parking Program";
              currentParcel = parcel[0].attributes["TaxParcelNumber"];
              address = "<div><b>Parcel Address</b><br>" + parcel[0].attributes["Site_Address"]  + "<br>&nbsp;</div>"; 
                address += "<div style='clear:both;'><b>Parcel " + parcel[0].attributes["TaxParcelNumber"] + ": </b><a title='Assessor Information Link' href=\"https://epip.co.pierce.wa.us/CFApps/atr/epip/summary.cfm?parcel=" + parcel[0].attributes["TaxParcelNumber"]  + "\" target=\"_blank\">Assessor</a><br>&nbsp;</div>";
                address += "<div style='clear:both;' id='messages'></div>"; //place holder id='messages'for the rest of the query info - filled in by deferred functions
              
              //Use parcel geometry for RPP query - put results into 'messages' div
              paramsBuffer.geometries = [parcel[0].geometry];
              var bufferedGeometries = gsvc.buffer(paramsBuffer);  //BUFFER the parcel
                    //Using dojo deferred 'then' function to set callback and errback functions
                    bufferedGeometries.then(function(bufferedGeometries) {
                      //First Deferred - Parcel buffer results
                        qRPP.geometry = bufferedGeometries[0];  //Query with buffer polygon - use parcel inside buffer, not map click point
                        qtRPP.execute(qRPP, function(results) {  
                          //Second Deferred (execute) - Query with buffer polygon results
                          var r="";
                          var allowedUses = "";
                          var RPPResults = results.features;

                              //update RPPResults info
                              if (RPPResults.length>0) {
                                    if (RPPResults.length>1) {
                                     //MULTIPLE POLYGONS (Calico) - 8945001992
                                        //Message: Get current address for email details (currentParcel)
                                        theMessage = "According to our records, the location you entered falls under more than one zoning classification. This requires further assessment.";

                                        allowedUses += "<div style='clear:both;'><hr color='#ACB1DB'></div>";
                                        allowedUses += "<div style='float:left;'><b>Qualify?</b>";
                                        allowedUses += "<br>"+ theMessage + " Please contact Parking Services at <a href='mailto:rpp@cityoftacoma.org?subject=Residential Parking Program Map - Parcel " + currentParcel + "&body=SITE INFORMATION FOR PARKING SERVICES STAFF: %0D%0AParcel " + currentParcel + "%0D%0A" + theMessage + "%0D%0A %0D%0A Please add your comments and contact information here -->' onfocus='this.blur();'>rpp@cityoftacoma.org</a> for determination. <br>&nbsp;</div>";

                                    } else {  
                                      arrayUtils.forEach(RPPResults, function(RPPResultsRec) { //loop through multiple records (just 1 now)
                                        allowedUses += "<div style='clear:both;'><hr color='#ACB1DB'></div>";
                                        allowedUses += "<div style='float:left;'><b>Qualify?</b>";

                                        if (RPPResultsRec.attributes.E_Status==1) {
                                          //Eligible - 3 options (run additional query useBuffer_RPZ)
                                          allowedUses += "<br><span id='RPZ_Info'>Congratulations!</span><br>&nbsp;</div>";
                                            //Update the span RPZ_Info with any RPZ info in the area (3 outcomes)
                                            paramsBuffer_RPZ.geometries = paramsBuffer.geometries;  //use existing select parcel boundary for geometry
                                            var bufferedOutsideGeometries = gsvc.buffer(paramsBuffer_RPZ);  //buffer outside parcel
                                                bufferedOutsideGeometries.then(function(bufferedGeometries) {
                                                  //Third Deferred (execute) - buffer outside parcel buffer
                                                  //Query RPZ with buffered parcel polygon
                                                  qRPZ.geometry = bufferedGeometries[0];  //use parcel outside buffer, not map click point
                                                  qtRPZ.execute(qRPZ, function(results) {
                                                   //Fourth Deferred - run query with resulting parcel buffer
                                                  //Update the span with any RPZ info in the area (3 outcomes)
                                                  if (results.features.length>0) {
                                                     //???FUTURE - what to do if multiple RPZ - 1201 N 4TH ST
                                                     //START HERE - Using zoning code with a '-' as a sample test
                                                      if (results.features[0].attributes.ZoningClas.includes("-")) {
                                                        //Parcel 2033250060
                                                        dom.byId("RPZ_Info").innerHTML = "Congratulations! According to our records, your residence is eligible to obtain a parking permit for a Residential Parking Zone. To find out how to obtain a permit please check out <a href='https://www.tacomaresidentialparking.com/residential-permits.html' target='_blank' onfocus='this.blur();'>Residential Permits</a>.";
                                                      } else {
                                                        //Parcel 2033250020
                                                        theMessage = "According to our records, a Residential Parking zone is either in the process of being proposed or is already existing near your location. Your residence is eligible to request a modification for an extension to the nearby RPZ.";
                                                        dom.byId("RPZ_Info").innerHTML = "Congratulations! " + theMessage + " For more information on how to begin this process of modification please contact <a href='mailto:rpp@cityoftacoma.org?subject=Residential Parking Program Map - Parcel " + currentParcel + "&body=SITE INFORMATION FOR PARKING SERVICES STAFF: %0D%0AParcel " + currentParcel + "%0D%0A" + theMessage +"%0D%0A %0D%0A Please add your comments and contact information here -->' onfocus='this.blur();'>Parking Services</a>.";
                                                      } 

                                                      //Add RPZ graphic to map
                                                      var sls = new SimpleLineSymbol(
                                                        SimpleLineSymbol.STYLE_DASH,
                                                        new Color([0,0,255]),
                                                        3
                                                      );
                                                      resultGraphic = results.features;
                                                      arrayUtils.forEach(resultGraphic, function(feat) {
                                                        feat.setSymbol(sls);
                                                        map.graphics.add(feat);  // Add the resultGraphic boundary to the map
                                                      });

                                                  } else {
                                                    //No existing RPZ found (Green) - Parcel 2033250010
                                                    dom.byId("RPZ_Info").innerHTML = "Congratulations! According to our records, your residence is eligible for the creation of a Residential Parking Zone. If interested on how to begin this process please contact Parking Services at <a href='mailto:rpp@cityoftacoma.org?subject=Residential Parking Program Map - Creation of a Residential Parking Zone - Parcel " + currentParcel + "' onfocus='this.blur();'>rpp@cityoftacoma.org</a>.";
                                                  }

                                                  }, function(err){
                                                    //Fourth Deferred Error
                                                    alert("Error in identify: " + err.message);
                                                    console.error("Identify Error: " + err.message);
                                                  });

                                                }, function(err){
                                                  //Third Deferred Error
                                                  alert("Error in buffer: " + err.message);
                                                  console.error("Buffer Error: " + err.message);
                                                });

                                        } else if (RPPResultsRec.attributes.E_Status==2) {
                                          //PTAG Regulated (Gray) - 7735000040
                                          //allowedUses += "<br>The location entered does not qualify for the Residential Parking Program. The location falls under a zoning classification that is currently being reviewed by the Parking Technical Advisory Group. Existing Residential Parking Zones in this area will dissolve two years after the adoption of the new program. To learn more about PTAG and the process for establishing parking control strategies for this mixed use area please contact Parking Services at <a href='mailto:rpp@cityoftacoma.org?subject=Residential Parking Program Map - PTAG - Parcel " + currentParcel + "' onfocus='this.blur();'>rpp@cityoftacoma.org</a>. <br>&nbsp;</div>";
                                          allowedUses += "<br>The location entered falls under a mixed use zoning classification. These areas have different specifications for size and layout. The Residential Parking Program does allow Residential Parking Zones in areas of mixed use but must be verified first for eligibility by City of Staff. Please contact Parking Services at <a href='mailto:rpp@cityoftacoma.org?subject=Residential Parking Program Map - PTAG - Parcel " + currentParcel + "' onfocus='this.blur();'>rpp@cityoftacoma.org</a> to inquire about eligibility. <br>&nbsp;</div>";
                                        } else if (RPPResultsRec.attributes.E_Status==3) {
                                          //Not Eligible (Red-brown) - 2009090013
                                          allowedUses += "<br>The location entered does not qualify for the Residential Parking Program. Existing Residential Parking Zones will dissolve two years after the adoption of the new program. During this transition we recommend for you to explore other parking alternatives. For more information please contact Parking Services at <a href='mailto:rpp@cityoftacoma.org?subject=Residential Parking Program Map  - Parcel " + currentParcel + " ' onfocus='this.blur();'>rpp@cityoftacoma.org</a>.<br>&nbsp;</div>";
                                        } else {
                                          //Just in case there are null/blank polygons
                                          allowedUses += "<br>Sorry, no information available for this site.<br>&nbsp;</div>";
                                        }                      

                                      });
                                    }

                                      allowedUses += "<div style='clear:both;'><hr color='#ACB1DB'></div>";

                                  r = allowedUses + contactInfo + closeButton + mobileSpacer;

                              } else {
                                  r = "<div style='clear:both;'><hr color='#ACB1DB'></div>Sorry, location is outside Tacoma City Limits.<div style='clear:both;'><hr color='#ACB1DB'></div>" + contactInfo + closeButton;
                              }

                          dom.byId('messages').innerHTML = r;    //update report message

                        }, function(err){
                          //Second Deferred Error
                          alert("Error in identify: " + err.message);
                          console.error("Identify Error: " + err.message);
                        });
 
                     }, function(err) {
                        //First Deferred Error
                        alert("Error retrieving parcel results: " + err.message);
                        console.error("Parcel Buffer Error: " + err.message);
                    });  

             } else {
                  //Not a parcel - REMOVE PARCEL INFO
                  var title = "Non-parcel"
                  address = "<div><i>This location is not a parcel.</i> </div><div id='messages'></div>";
                  address += "<div><i>Try clicking a nearby parcel.</i></div>" + closeButton;
                  map.setLevel(18);  //zoom to level 18 since there isn't a parcel to zoom to
            }        

             //Open info window and update content
             map.infoWindow.setTitle(title);
             var infoDiv = document.createElement("div");
              infoDiv.innerHTML = address;
              map.infoWindow.setContent(infoDiv); //add content details          

            //display the info window with the address information
            var screenPnt = map.toScreen(candidate_location);  //from map click or geocode

                map.infoWindow.show(screenPnt);  //open popup

          arrayUtils.forEach(parcel, function(feat) {
            feat.setSymbol(symbolParcel);
            map.graphics.add(feat);  // Add the parcel boundary to the map
            map.setExtent(feat._extent.expand(3.0));  //Zoom map to a multiple of parcel extent
          });

          map.centerAt(candidate_location);    //no offset

        } //last function
         
      }; //end mjm_ClickReportFunctions

  return mjm_ClickReportFunctions;  //Return an object that exposes new functions

});

