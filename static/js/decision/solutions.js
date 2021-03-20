//Calling the score API and Adding information to the tables
// var table = $('#events').DataTable( {
//     paging: true,
//     responsive: true,
//     "sDom":"tipr",
//     pageLength : 10,
//     // order: [[, 'Time']],
//     "ajax": {
//         "url": "http://127.0.0.1:5001/decision/events",
//         "type": "GET",
//         "datatype": 'json',
//     },
//     columns: [
//         { 'data': 'timestamp'}, 
//         { 'data': 'resilience_level'},
//         { 'data': 'problem_desc'}, 
//         { 'data': 'cp_tram'}, 
//         { 'data': 'cp_tram'}, 
//         { 'data': 'problem_type'}, 
//         { 'data': '', defaultContent: 'Available'}
//     ],
 
// } );

// # 'problem_id', 'resilience_level', 'problem_type', 'event_duration', 'violation_threshold', 'problem_desc', 'solution_id', 'solution_method', 'cp_tram',  'timestamp'

//Let's make an AJAX call and then add divs until the for loop ends
function getSolutions() {
$.ajax({
    url: "http://127.0.0.1:5001/decision/events",
    "type": "GET",
    "datatype": 'json',
    success: function(data){ 
        // console.log("data in the file------->" + data.data.length);
        // Getting a dictionary of solutions against each problem id
        var solutions = {}
        var tempData = data.data
        for (i=0; i<tempData.length; i++){
            var datum = tempData[i].problem_id;
            if (!solutions[datum]){
                solutions[datum] = [] 
            } 
            solutions[datum].push(tempData[i])
            // console.log(solutions)
        }

        for(var problem in solutions){
            console.log("problem ---> " + problem);
            
            //Create a problem card and a solution card for each problem. 
            var probdiv = document.createElement("div");
            probdiv.setAttribute("class", "probcard");
            var probtable = document.createElement('table');
            probtable.setAttribute("style","text-align:left");
            probtable.setAttribute("class","table table-sm table-bordered");

            var prob = solutions[problem][0]; 
            var probtext = document.createTextNode(prob.problem_id);
            probdiv.appendChild(probtext);
            var probs = document.getElementById("probs");

            var tr1 = document.createElement('tr');
            var tr2 = document.createElement('tr');
            var tr3 = document.createElement('tr');
            var tr4 = document.createElement('tr');
            var tr5 = document.createElement('tr');
            
            var td1 = document.createElement('td')
            var td2 = document.createElement('td');
            var td3 = document.createElement('td');
            var td4 = document.createElement('td');
            var td5 = document.createElement('td');
            var td6 = document.createElement('td');
            var td7 = document.createElement('td');
            var td8 = document.createElement('td');
            var td9 = document.createElement('td');
            var td10 = document.createElement('td');


            td1.appendChild(document.createTextNode('Description'));
            td3.appendChild(document.createTextNode('Resilience Level'));
            td5.appendChild(document.createTextNode('Type'));
            td7.appendChild(document.createTextNode('Duration of event'));
            td9.appendChild(document.createTextNode('Violation Threshold'));

            td2.appendChild(document.createTextNode(prob.problem_desc)); 
            td4.appendChild(document.createTextNode(prob.resilience_level)); 
            td6.appendChild(document.createTextNode(prob.problem_type));
            td8.appendChild(document.createTextNode(prob.event_duration));
            td10.appendChild(document.createTextNode(prob.violation_threshold)); 
            
            tr1.appendChild(td1);
            tr1.appendChild(td2);

            tr2.appendChild(td3);
            tr2.appendChild(td4);

            tr3.appendChild(td5);
            tr3.appendChild(td6);

            
            tr4.appendChild(td7);
            tr4.appendChild(td8);

            tr5.appendChild(td9);
            tr5.appendChild(td10);

            probtable.appendChild(tr1); 
            probtable.appendChild(tr2); 
            probtable.appendChild(tr3); 
            probtable.appendChild(tr4); 
            probtable.appendChild(tr5); 


            //Creating solution table
            var soldiv = document.createElement("div");
            soldiv.setAttribute("class", "probcard");
            var soltable = document.createElement('table');
            soltable.setAttribute("style","text-align:left");
            soltable.setAttribute("class","table table-sm table-bordered");


            for(j=0; j < solutions[problem].length; j++){
                console.log("problem ---> " + solutions[problem][j].problem_desc);


                var temp = solutions[problem][j]; 
                
                var tr = document.createElement('tr'); 
                var td1 = document.createElement('td');
                td1.appendChild(document.createTextNode(temp.solution_id.trim())); 
                var td2 = document.createElement('td');
                td2.appendChild(document.createTextNode(temp.solution_method)); 
                var td3 = document.createElement('td');
                td3.appendChild(document.createTextNode(temp.cp_tram)); 
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3); 
                soltable.appendChild(tr); 
                
            }
            soldiv.appendChild(soltable);
            probdiv.appendChild(probtable);
            var sols = document.getElementById("sols");
            probs.appendChild(probdiv);
            sols.appendChild(soldiv); 
        }
    },
    error: function(){
        alert("There was an error.");
    }
});
}


getSolutions(); 

// setInterval( function () {
//     getSysFreq(); 
// }, 2000 );