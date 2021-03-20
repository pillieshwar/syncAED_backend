//Adding a map to the UI
var mymap = L.map('mapid').setView([47.3055701300, -120.1623439000], 5);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 30,
    id: 'mapbox/streets-v11',
    accessToken: 'sk.eyJ1IjoiYW5zaHVtYW5sbnUiLCJhIjoiY2s0Z3BmeWYyMTFsMTNlbnFheXRoNGZwNCJ9.hrTQnuCBmTImKpG541vu9Q'
}).addTo(mymap);

// Calling the map-data API and adding markers to the map.
var physicalAlertStatus = false;
var location_arr = []; 
function getMapData() {
    //Ajax call
        $.ajax({
            url: "http://127.0.0.1:5001/map-data", 
            success: function(results){
            let data = results.data
            for( i=0; i<data.length; i++){
                lat = Number(data[i].gis_latitude); 
                long = Number(data[i].gis_longitude);
                isPhyTrue = data[i].bus_status;
                if(isPhyTrue==0) {
                    if (physicalAlertStatus == false){
                        alert("Detected new firmware update for IED device (MAC: xx-xx-xx-xx-xx-xx) at bus 11"); 
                        physicalAlertStatus = true
                    }
                }
                L.circleMarker(([lat, long]), {   
                    color: 'green',
                    fillColor: isPhyTrue==1 ? 'green' : 'red',
                    fillOpacity: 0.5,
                    riseOnHover: true,
                    radius: 10
                }).addTo(mymap).bindTooltip(
                    "<b>Bus:</b> " + String(data[i].bus_name) + "<br>" +
                    "<b>Physical Violations:</b> None"+ "<br>" +
                    "<b>Communication Status:</b> Normal" + "<br>" +
                    "<b>Cyber Assets:</b> 12/12" + "<br>" + 
                    "<b>Unresponsive Assets:</b> 0" + "<br>" + 
                    "<b>Attack Detection Status:</b> Active" + "<br>"+
                    "<b>Potential Risks:</b> 0"
                );
            }

            let connectionfrom = results.connectionfrom
            let connectionto = results.connectionto
            for(j=0; j<connectionfrom.length; j++){
                let latlngs = [
                    [connectionfrom[j].gis_latitude, connectionfrom[j].gis_longitude], 
                    [connectionto[j].gis_latitude, connectionto[j].gis_longitude]
                ];
                L.polyline(latlngs, {color:'black'}).addTo(mymap);
            }
        }
    });
};

setInterval( function () {
    getMapData(); 
}, 2000 );

  
$("a[href='#physical']").on('shown.bs.tab', function (e) {
    mymap.invalidateSize();
});


//Calling the score API and Adding information to the tables
var table = $('#businfo').DataTable( {
    paging: true,
    "sDom":"tipr",
    pageLength : 5,
    order: [[3, 'desc']],
    "ajax": {
        "url": "http://127.0.0.1:5001/physical/livevoltages",
        "type": "GET",
        "datatype": 'json',
    },
    columns: [
        { 'data': 'bus_id' },
        { 'data': 'bus_name' },
        { 
            'data': 'base_kv',
            render: function(data, type, row){
                return parseFloat(data).toFixed(2);
            }
        },
        { 
            'data': 'bus_voltage',
            render: function(data, type, row){
                return parseFloat(data).toFixed(4);
            }
        }
    ],
    "createdRow": function( row, data, dataIndex ) {
        if ( data.bus_voltage < 0.95 || data.bus_voltage > 1.05) {        
            $(row).addClass('red');
        }
        else if (data.bus_voltage > 0.95 && data.bus_voltage < 0.98) {
            $(row).addClass('orange');
        }
        else if (data.bus_voltage >= 0.98 && data.bus_voltage <= 1.05){
            $(row).addClass('green');
        }
  }
} );


var powerTable = $('#powerTable').DataTable( {
    paging: true,
    "sDom":"tipr",
    pageLength : 5,
    order: [[3, 'desc']],
    "ajax": {
        "url": "http://127.0.0.1:5001/physical/transpower",
        "type": "GET",
        "datatype": 'json',
    },
    columns: [
        { 
            data: 'branch_id',

        },
        { 
            'data': 'voltage_level',
            render: function(data, type, row){
                return parseFloat(data).toFixed(2) + ' kV';
            }
        },
        { 
            'data': 'transferred_mva',
            render: function(data, type, row){
            return parseFloat(data).toFixed(3);
        }
        },
        {
            data: null, 
            render: function(data, type, row){
                // console.log("This is f data " + parseFloat(data)/parseFloat(row.transferred_mva));
                // console.log("This is f data " + row.transferred_mva)
                percentage = ((row.transferred_mva / row.mva_line_rating) * 100); 
                if(percentage > 90){
                    return  '<progress class="progress" id="progressred" value="' + percentage + '" max="100" data-text="'+ parseInt(percentage) +'%">'+ percentage +'</progress>';
                }
                else if(percentage > 80 && percentage <= 90){
                    return  '<progress class="progress" id="progressorange" value="' + percentage + '" max="100" data-text="'+ parseInt(percentage) +'%">'+ percentage +'</progress>';
                }
                return  '<progress class="progress" id="progressgreen" value="' + percentage + '" max="100" data-text="'+ parseInt(percentage) +'%">'+ percentage +'</progress>';
               
            } 
        }
    ]
//     ,
//     "createdRow": function( row, data, dataIndex ) {
//         if ( data.transferred_mva < 0.95 || data.transferred_mva > 1.05) {        
//             $(row).addClass('red');
//         }
//         else if (data.transferred_mva > 0.95 && data.transferred_mva < 0.98) {
//             $(row).addClass('orange');
//         }
//         else if (data.transferred_mva >= 0.98 && data.transferred_mva <= 1.05){
//             $(row).addClass('green');
//         }
//   }
 
} );

 
setInterval( function () {
    table.ajax.reload();
    // powerTable.ajax.reload(); 
}, 30000 );


// Calling the chart-data api to plot chart
var result_val = 0.0;
function getData() {
    //Ajax call
        $.ajax({url: "http://127.0.0.1:5001/chart-data", 
        success: function(data){
            result_val = data
        }});
        // document.getElementById('tramscore2').innerHTML = result_val.results;
        return result_val
}

var physicalScores = 0.0;
function getPhysicalScoresData() {
    //Ajax call
        $.ajax({url: "http://127.0.0.1:5001/physical/scores", 
        success: function(data){
            console.log("This is the physical scores data: "+ data.data); 
            physicalScores = data.data
        }});
        document.getElementById('spdIdxLabel').innerHTML = physicalScores.spd_index;
        document.getElementById('mwLabel').innerHTML = physicalScores.mw_available;
        document.getElementById('mvarLabel').innerHTML = physicalScores.mvar_available;
        document.getElementById('lolLabel').innerHTML = physicalScores.loss_of_load;
        document.getElementById('physicalTramScore').innerHTML = physicalScores.physical_score;
        return physicalScores
}



var layout = {
    
    xaxis: {
      title: 'Time'
    },
    yaxis: {
      title: 'Tram Score',
      range: [0,1.5],
      dtick: 0.1,
    }, 
    margin: {
        l: 60,
        r: 10,
        b: 70,
        t: 15,
        pad: 4
      },
  };


  var physicallayout = {
    
    xaxis: {
      title: 'Time'
    },
    yaxis: {
      title: 'Physical Resiliency Score',
      range: [0,1.5],
      dtick: 0.1,
    }, 
    margin: {
        l: 60,
        r: 10,
        b: 70,
        t: 15,
        pad: 4
      },
  };

TESTER = document.getElementById('tester');
Plotly.plot(TESTER,[{
    x:[getData().time],
    y:[getData().results],
    type:'line'
}], physicallayout, {scrollZoom: true});

var cnt = 0;
setInterval(function(){
    data = getData()
    // console.log(typeof(data.time))
    Plotly.extendTraces(TESTER,{ 
        x:[[data.time]], 
        y:[[data.results]],
    }, [0]);
    cnt++;
    if(cnt > 8) {
        Plotly.relayout(TESTER,{
            xaxis: {
                range: [cnt-8,cnt+1],
                title: 'Time',
            }
        });
    }
},2000);



//SPD Index
var spdlayout = {
    
    xaxis: {
      title: 'Time'
    },
    yaxis: {
      title: 'SPD index',
      range: [0,12],
      dtick: 2,
    }, 
    margin: {
        l: 60,
        r: 10,
        b: 70,
        t: 15,
        pad: 4
      },
  };

spdIdx = document.getElementById('spdIndex');
Plotly.plot(spdIdx,[{
    x:[getPhysicalScoresData().time],
    y:[parseInt(getPhysicalScoresData().spd_index)],
    type:'line'
}], spdlayout, {scrollZoom: true});

var cntspdIdx = 0;
setInterval(function(){
    data = getPhysicalScoresData()
    // console.log(typeof(data.time))
    Plotly.extendTraces(spdIdx,{ 
        x:[[data.time]], 
        y:[[data.spd_index]],
    }, [0]);
    cntspdIdx++;
    if(cntspdIdx > 8) {
        Plotly.relayout(spdIdx,{
            xaxis: {
                range: [cntspdIdx-8,cntspdIdx+1],
                title: 'Time',
            }
            
        });
    }
},2000);


//Mvar available
var mvarlayout = {
    
    xaxis: {
      title: 'Time'
    },
    yaxis: {
      title: 'MVAR index',
      range: [-5,5],
      dtick: 1,
    }, 
    margin: {
        l: 60,
        r: 10,
        b: 70,
        t: 15,
        pad: 4
      },
  };

mvarAvail = document.getElementById('mvarAvail');
Plotly.plot(mvarAvail,[{
    x:[getPhysicalScoresData().time],
    y:[getPhysicalScoresData().mvar_available],
    type:'line'
}], mvarlayout, {scrollZoom: true});

var mvarCount = 0;
setInterval(function(){
    data = getPhysicalScoresData()
    // console.log(typeof(data.time))
    Plotly.extendTraces(mvarAvail,{ 
        x:[[data.time]], 
        y:[[data.mvar_available]],
    }, [0]);
    mvarCount++;
    if(mvarCount > 8) {
        Plotly.relayout(mvarAvail,{
            xaxis: {
                range: [mvarCount-8,mvarCount-0],
                title: 'Time',
            }
            
        });
    }
},2000);


//MW available
var mwlayout = {
    
    xaxis: {
      title: 'Time'
    },
    yaxis: {
      title: 'MW Available',
      range: [-5,5],
      dtick: 1,
    }, 
    margin: {
        l: 60,
        r: 10,
        b: 70,
        t: 15,
        pad: 4
      },
  };

mwAvail = document.getElementById('mwAvail');
Plotly.plot(mwAvail,[{
    x:[getPhysicalScoresData().time],
    y:[getPhysicalScoresData().mw_available],
    type:'line'
}], mwlayout, {scrollZoom: true});

var cntmw = 0;
setInterval(function(){
    data = getPhysicalScoresData()
    // console.log(typeof(data.time))
    Plotly.extendTraces(mwAvail,{ 
        x:[[data.time]], 
        y:[[data.mw_available]],
    }, [0]);
    cntmw++;
    if(cntmw > 8) {
        Plotly.relayout(mwAvail,{
            xaxis: {
                range: [cntmw-8,cntmw-0],
                title: 'Time',
            }
        });
    }
},2000);


//Loss of load Index
var lollayout = {
    
    xaxis: {
      title: 'Time'
    },
    yaxis: {
      title: 'Loss of load Index',
      range: [0,10],
      dtick: 2,
    }, 
    margin: {
        l: 60,
        r: 10,
        b: 70,
        t: 15,
        pad: 4
      },
  };

lolIdx = document.getElementById('lolIdx');
Plotly.plot(lolIdx,[{
    x:[getPhysicalScoresData().time],
    y:[getPhysicalScoresData().loss_of_load],
    type:'line'
}], lollayout, {scrollZoom: true});

var cntlolIdx = 0;
setInterval(function(){
    data = getPhysicalScoresData()
    // console.log(typeof(data.time))
    Plotly.extendTraces(lolIdx,{ 
        x:[[data.time]], 
        y:[[data.loss_of_load]],
    }, [0]);
    cntlolIdx++;
    if(cntlolIdx > 8) {
        Plotly.relayout(lolIdx,{
            xaxis: {
                range: [cntlolIdx-8,cntlolIdx-0],
                title: 'Time',
            }  
        });
    }
},2000);



  
//   var trace2 = {
//     x: ['22:00', '23:00', '00:00'],
//     y: [1,
//         1,
//         0.547266881        
//     ],
//     type: 'scatter',
//     name: 'TRAM',
//     mode: 'lines',
//     line: {shape: 'vh'}
//   };
  
//   var trace1 = {
//     x: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00','11:00'],
//     y: [
        
//         ],
//     type: 'scatter',
//     name: 'TRAM-ERROR',
//     mode: 'lines',
//     line: {
//         dash: 'dot',
//         width: 4,
//         color: 'red',
//         shape: 'vh'
//     }
//   };
  
//   var data = [trace2,trace1];
  
//   Plotly.newPlot('overview-chart', data);

// physicalchart = document.getElementById('tester');
// Plotly.newPlot(physicalchart, data, layout2, {scrollZoom: true});