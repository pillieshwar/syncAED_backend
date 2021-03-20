//Calling the score API and Adding information to the tables
var DecisionEventtable = $('#events').DataTable( {
    paging: true,
    responsive: true,
    "sDom":"tipr",
    pageLength : 10,
    // order: [[, 'Time']],
    "ajax": {
        "url": "http://127.0.0.1:5001/decision/events",
        "type": "GET",
        "datatype": 'json',
    },
    columns: [
        { 'data': 'timestamp'}, 
        { 'data': 'resilience_level'},
        { 'data': 'problem_desc'}, 
        { 'data': 'cp_tram'}, 
        { 'data': 'cp_tram'}, 
        { 'data': 'problem_type'}, 
        // { 'data': '', defaultContent: 'Available'}
        { 
            'data': '',
            "render": function(data, type, row, meta){
                data = '<a href="http://127.0.0.1:5000/cve/' + '" target="_blank">' + "Available" + '</a>';
                return data;
            }
        }
    ],
    
} );

//Calling the score API and Adding information to the tables
var cyberPhyEventTable = $('#cyberPhysicalResiliency').DataTable( {
    paging: true,
    responsive: true,
    "sDom":"tipr",
    pageLength : 3,
    // order: [[, 'Time']],
    "ajax": {
        "url": "http://127.0.0.1:5001/cyberphysical/events",
        "type": "GET",
        "datatype": 'json',
    },
    columns: [
        { 'data': 'timestamp'}, 
        { 'data': 'resilience_level'},
        { 'data': 'problem_desc'},
        { 'data': 'priority'},  
        { 'data': 'cp_tram'}, 
        { 'data': 'tram_change'}, 
        // { 'data': 'root_cause'},  
        // { 'data': '', defaultContent: 'Available'}
        { 
            'data': '',
            "render": function(data, type, row, meta){
                data = '<a href="http://127.0.0.1:5000/cve/' + '" target="_blank">' + "Available" + '</a>';
                return data;
            }
        }
    ],
    
} );


    var PhyEventTable = $('#physicalEvents').DataTable( {
    paging: true,
    responsive: true,
    "sDom":"tipr",
    pageLength : 3,
    // order: [[, 'Time']],
    "ajax": {
        "url": "http://127.0.0.1:5001/physical/events",
        "type": "GET",
        "datatype": 'json',
    },
    columns: [
        { 'data': 'timestamp'}, 
        { 'data': 'resilience_level'},
        { 'data': 'problem_desc'},
        { 'data': 'priority'},  
        { 'data': 'cp_tram'}, 
        { 'data': 'tram_change'}, 
        // { 'data': 'root_cause'},  
        // { 'data': '', defaultContent: 'Available'}
        { 
            'data': '',
            "render": function(data, type, row, meta){
                data = '<a href="http://127.0.0.1:5000/cve/' + '" target="_blank">' + "Available" + '</a>';
                return data;
            }
        }
    ],
    
} );


var cyberEventTable = $('#cyberResileinceEvents').DataTable( {
    paging: true,
    responsive: true,
    "sDom":"tipr",
    pageLength : 3,
    // order: [[, 'Time']],
    "ajax": {
        "url": "http://127.0.0.1:5001/cyber/events",
        "type": "GET",
        "datatype": 'json',
    },
    columns: [
        { 'data': 'timestamp'}, 
        { 'data': 'resilience_level'},
        { 'data': 'problem_desc'},
        { 'data': 'priority'},  
        { 'data': 'cp_tram'}, 
        { 'data': 'tram_change'},
        // { 'data': 'root_cause'}, 
        // { 'data': '', defaultContent: 'Available'}
        { 
            'data': '',
            "render": function(data, type, row, meta){
                data = '<a href="http://127.0.0.1:5000/cve/' + '" target="_blank">' + "Available" + '</a>';
                return data;
            }
        }
    ],
    
} );



setInterval( function () {
    // cyberPhysicalResiliency.ajax.reload();
    // DecisionEventtable.ajax.reload(); 
    cyberPhyEventTable.ajax.reload();
    // PhyEventTable.ajax.reload();
    console.log("This is before the reload");
    PhyEventTable.ajax.reload();
    
    console.log("This is after the reload");
    cyberEventTable.ajax.reload();
}, 3000 );



// # 'problem_id', 'resilience_level', 'problem_type', 'event_duration', 'violation_threshold', 'problem_desc', 'solution_id', 'solution_method', 'cp_tram',  'timestamp'


// physicalEvents
//cyberResileinceEvents