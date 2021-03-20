var result_val2 = 0.0;
function getData2() {
    //Ajax call
        $.ajax({url: "http://127.0.0.1:5001/chart-data", 
        success: function(data){
            result_val2 = data
            document.getElementById('tramscore').innerHTML = data.results          
        }});
        return result_val2
}

function getSysFreq() {
    //Ajax call
        $.ajax({url: "http://127.0.0.1:5001/chart-data", 
        success: function(data){       
        }});
        return result_val2
}

setInterval( function () {
    getSysFreq(); 
}, 2000 );


function getpacketloss() {
    //Ajax call
        $.ajax({url: "http://127.0.0.1:5001/chart-data", 
        success: function(data){
            // console.log("This is the test data : " + data.time)
            // document.getElementById('packetloss').innerHTML = ("" + data.results + "%")           
        }});
        
}

setInterval( function () {
    getpacketloss(); 
}, 2000 );


var layout2 = {
    // title: 'CP-Tram Live Graph',
    xaxis: {
      title: 'Time',
    },
    yaxis: {
      title: 'CP-Tram',
      range: [0,1.5],
      dtick: 0.1,
      showline: true,
      showgrid: true,
      zeroline: true,
    }, 
    margin: {
        l: 60,
        r: 40,
        b: 70,
        t: 50,
        pad: 4
      },
  };

OVERVIEW = document.getElementById('overview-chart');
Plotly.plot(OVERVIEW,[{
    x:[getData2().time],
    y:[getData2().results],
    type:'line',
    line: {
        shape: 'hv',
        color: getData2().results < 1 ? 'red' : 'black'
    },
}], layout2, {scrollZoom: true});

var overview_cnt = 0;
setInterval(function(){
    data = getData2()
    // console.log(typeof(data.time))
    Plotly.extendTraces(OVERVIEW,{ 
        x:[[data.time]], 
        y:[[data.results]],
    }, [0]);
    overview_cnt++;
    if(overview_cnt > 8) {
        Plotly.relayout(OVERVIEW,{
            xaxis: {
                range: [overview_cnt-8,overview_cnt-0],
                title: 'Time',
            },
            yaxis: {
                title: 'Tram Score',
                range: [0,1.5],
                dtick: 0.1,
                showline: true,
                showgrid: true,
                zeroline: true,
              },
               
            margin: {
                l: 60,
                r: 40,
                b: 70,
                t: 50,
                pad: 4
            }
        });
    }
},2000);


//Live Map

//Adding a map to the UI

var overviewmap = L.map('overview-map').setView([47.3055701300, -120.1623439000], 5);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 30,
    id: 'mapbox/streets-v11',
    // id: 'mapbox/satellite-v9',
    accessToken: 'sk.eyJ1IjoiYW5zaHVtYW5sbnUiLCJhIjoiY2s0Z3BmeWYyMTFsMTNlbnFheXRoNGZwNCJ9.hrTQnuCBmTImKpG541vu9Q'
}).addTo(overviewmap);

// Calling the map-data API and adding markers to the map.
var location_arr_overview = []; 
function getOverviewMapData() {
        $.ajax({
            url: "http://127.0.0.1:5001/map-data", 
            success: function(results){
                let connectionfrom = results.connectionfrom
                let connectionto = results.connectionto
                for(j=0; j<connectionfrom.length; j++){
                    let latlngs = [
                        [connectionfrom[j].gis_latitude, connectionfrom[j].gis_longitude], 
                        [connectionto[j].gis_latitude, connectionto[j].gis_longitude]
                    ];
                    // console.log(latlngs)
                    L.polyline(latlngs, {color:'black'}).addTo(overviewmap);
                }

            let data = results.data

            for( i=0; i<data.length; i++){
                console.log(data[i]);
                lat = Number(data[i].gis_latitude); 
                long = Number(data[i].gis_longitude);
                isTrue = data[i].bus_status;
                L.circleMarker(([lat, long]), {   
                    color: 'green',
                    fillColor: isTrue==1 ? 'green' : 'red',
                    fillOpacity: 0.5,
                    riseOnHover: true,
                    radius: 10
                }).addTo(overviewmap).bindTooltip(
                    "<b>Bus:</b> " + String(data[i].bus_name) + "<br>" +
                    "<b>Physical Violations:</b> None"+ "<br>" +
                    "<b>Communication Status:</b> Normal" + "<br>" +
                    "<b>Cyber Assets:</b> 12/12" + "<br>" + 
                    "<b>Unresponsive Assets:</b> 0" + "<br>" + 
                    "<b>Attack Detection Status:</b> Active" + "<br>"+
                    "<b>Potential Risks:</b> 0" 
                    );
                
                // .openTooltip();
            }

            
        }
    });
};

setInterval( function () {
    getOverviewMapData();
}, 2000);

  
$("a[href='#overview']").on('shown.bs.tab', function (e) {
    overviewmap.invalidateSize();
    // $('#example').DataTable();
});


$("a[href='#monitoring']").on('shown.bs.tab', function (e) {
    overviewmap.invalidateSize();
    // $('#example').DataTable();
});

// monitoring