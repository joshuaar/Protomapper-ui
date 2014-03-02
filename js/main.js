var app = angular.module('app', ['ui.bootstrap','ngTable'])
var webroot = ""
app.service('results', function($rootScope, $http) {
    var results = {};
    return {
        set : function(newRes){
            results = newRes
            $rootScope.$broadcast("querySubmitted",results)
            console.log(results.num)
        },
        get : function(){
            return results
        },
        getFromServer: function(queryJSON){
            var queryClosure = function(frm,to,callback){
                $http.get("/query?"+"q="+queryJSON+"&r="+frm+"%%"+to).success(callback);
            }
            var summaryClosure = function(callback){
                $http.get("/summary?"+"q="+queryJSON+"&r="+frm+"%%"+to).success(callback);
            }
            queryClosures = {"query": queryClosure, "summary": summaryClosure}
            console.log("Packaged Query as closure for pagination")
            $rootScope.$broadcast("querySubmitted",queryClosures)
        }
    }
})
// Typical result from server
//{ "num":515,"rng":[1,2],"query":"AVNFK",
//    "res":[{
//    "seq":"MAQAMQMTNVALPTSMDKKTYAVNFKGLIAHLLDILFVDNSAPRSYYAEDLSAHIQKDIGMYR" ,
//    "acc":"YP_008269995.1" ,
//    "desc":"gi|525853438|ref|YP_008269995.1| hypothetical protein M636_03730 [Vibrio parahaemolyticus O1:K33 str. CDC_K4557]" ,
//    "org":"Vibrio parahaemolyticus O1:K33 str. CDC_K4557" ,
//    "db":"custom" }]
//}


var promptCtrl = function($scope,results) {
    $scope.patt = [{"val":""}];
    $scope.addPatt = function() {
        $scope.patt.push({"val":""})
    }
    $scope.clear = function() {
        $scope.patt = [{"val":""}]
    }
    $scope.search = function() {
        //Get JSON here
	qstring = []
        for(i in $scope.patt)
            qstring=qstring.concat($scope.patt[i].val)
        results.getFromServer(qstring.join("^").toUpperCase())
    }
    curEx = 0 
    $scope.examples = function() {
        console.log("examples invoked")
        var ex = ["AVH[NEA]DY","KLH.{2,4}GEA","AVHAD","AVNFKY"]
        $scope.patt[0].val = ex[curEx % ex.length] 
        curEx+=1
    }

}
//helper function for sorting summary data
var sortSummary = function(data) {
    var sortable = []
    for(i in data) {
        sortable.push([i,data[i]]);
    }
    return sortable.sort( function(a,b){ return a[1] - b[1] } )
}

var putChart = function(data){
    var plotdata = {"key": "Distribution of hits", values:[]}
    var counter = 0
    var otherCount = 0
    var sorted = sortSummary(data)
    for(var i = sorted.length - 1; i >= 0; i--){
        if(counter >=8){
            otherCount += sorted[i][1]
        } else {
            //console.log(i)
            plotdata.values.push({"label":sorted[i][0],"value":sorted[i][1]})
        }
        counter += 1
    }
    if(otherCount > 0){
        plotdata.values.push({"label":"other","value":otherCount})
    }
    plotdata = [plotdata]
    nv.addGraph(function() {
        d3.select("#chart svg")
            .remove();
        d3.select("#chart").append("svg")
        var chart = nv.models.pieChart()
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .showLabels(true);

        d3.select("#chart svg")
            .datum(plotdata)
            .transition().duration(1200)
            .call(chart);

        return chart;
    });
}

var realsummary = {"Beutenbergia":1,"Jannaschia":1,"Rhodobacter":3,"Methanobrevibacter":1,"Acidovorax":2,"Nocardia":1,"Aeromonas":2,"Jonesia":1,"Sorangium":1,"Streptomyces":5,"Corallococcus":1,"Geobacter":2,"Haliscomenobacter":1,"Leptothrix":1,"Mycobacterium":1,"Pseudomonas":4}

app.controller('ChartCtrl', function($scope,$http,results) {
    putChart([])
    $scope.results = { "num":0,"rng":[1,5],"query":"NONE","res":[] } ;
    $scope.showRes = false;
    $scope.$on('querySubmitted',function(event,res){
        $scope.results = res
	$scope.showRes = true;
	//console.log(res.num+" NUM")
	$scope.$apply()
	$.getJSON(webroot+"/summary?q="+res.query,function(data){
	    putChart(data)
            console.log("got summary from server")
        })
    })
    $scope.matchRng = function(seq,regex) {
        var patt = new RegExp(regex,"i");
        var match = patt.exec(seq);
        //console.log(match)
        var start = match.index
        var text=match[0];
        var end = start+text.length;
        var out = start + " - " + text + " - " + end
        //console.log(out)
        return out
    }
})

//Grid with pagination for results
app.controller('GridCtrl', function($scope,$http,ngTableParams,results) {
   
    $scope.$on('querySubmitted', function(event,queryFuncs){
        $scope.query = queryFuncs.query
        $scope.summary = queryFuncs.summary
        var getNResultsCallback = function(result){
            $scope.tableParams.total(result["num"])
            $scope.tableParams.reload()
            console.log("Got number of results from server")
        }
        $scope.query(0,1,getNResultsCallback)
        
    })

    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
    }, {
        
        total: function () { return data.length; }, // length of data
        
        getData: function($defer, params) {
            //If query hook has been set, go ahead and use it
            if($scope.query)
            $scope.query((params.page()-1) * params.count(), params.page() * params.count(), function(result) {
                params.total(result["num"])
                $defer.resolve(result["res"])
            });
        }
    });
});