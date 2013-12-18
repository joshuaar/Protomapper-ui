var app = angular.module('app', ['ui.bootstrap'])

app.service('results', function($rootScope) {
    var results = {};
    return {
        set : function(newRes){
            results = newRes
            $rootScope.$broadcast("resultsChanged",results)
            console.log(results.num)
        },
        get : function(){
            return results
        },
        getFromServer: function(queryJSON,frm,to){
            $.getJSON("/query?q="+queryJSON+"&r="+frm+"%%"+to,function(data){
                console.log("Got results from server")
                results = data
                $rootScope.$broadcast("resultsChanged",data)
            })
        }
    }
})



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
        results.getFromServer($scope.patt[0].val,0,50)
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

var resCtrl = function($scope,results) {

    putChart([])
    $scope.results = { "num":0,"rng":[1,5],"query":"NONE","res":[] } ;
    $scope.showRes = false;
    $scope.$on('resultsChanged',function(event,res){
        $scope.results = res
	$scope.showRes = true;
	//console.log(res.num+" NUM")
	$scope.$apply()
	$.getJSON("/summary?q="+res.query,function(data){
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
}

app.directive('p2pagination', function() {
    return {
        restrict: "AE",
        template: ['<div class="pagination">',
            '<a href="#{{page}}" ng-click="fst()"><-- </a>',
            '<a href="#{{page}}" ng-click="prev()"> <- </a> | ',
            '<a href="#{{page}}" ng-repeat="page in pages" ng-click="goto(page)"> {{page}} </a> |',
            '<a href="#{{page}}" ng-click="next()"> -> </a>',
            '<a href="#{{page}}" ng-click="last()"> --> </a>',
            ' Page: {{page}} ',
            '</div>'
        ].join("\n")

    }
});

//Pagination needs the scope and the results variable


var getPageVector = function(nPages,curpage,maxDisplay) {
    out = []
    if(curpage <= maxDisplay){//if the current page is in the first n pages
        for(var i=1;i<=maxDisplay;i++)out.push(i)
    } else if(curpage > nPages - maxDisplay){//if the current page is in the last n pages
        for(var i=nPages;i>(nPages-maxDisplay);i--)out.push(i)
    } else {//if the current page is in the middle somewhere
        var eachSide = Math.floor(maxDisplay/2)
        for(var i=curpage-1;i>=curpage-eachSide;i--){out.push(i)}
        for(var i = curpage+1;i<=curpage+eachSide;i++)out.push(i)
        out.push(curpage)
    }
    return out.sort(function(a,b){return a-b}).slice(0,Math.min(maxDisplay,nPages))
}


var paginationCtrl = function ($scope, results) {
    $scope.results = results.get()
    $scope.$on('resultsChanged', function(event,res){
        $scope.results = res
        $scope.nPages = Math.ceil($scope.results.num / $scope.resPerPage)
    })


    $scope.totalItems = $scope.results.num;
    $scope.itemsPerPage = 50;
    $scope.currentPage = 1;
    $scope.maxSize = 5;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        results.getFromServer($scope.results.query,(pageNo-1)*itemsPerPage,pageNo*itemsPerPage)

    };
};

var p2paginationCtrl = function($scope, results) {
    $scope.results = results.get()
    $scope.page = 1
    $scope.resPerPage = 50
    $scope.nPages = Math.ceil($scope.results.num / $scope.resPerPage)
    $scope.pages = 1
    $scope.$on('resultsChanged', function(event,res){
        $scope.results = res
        $scope.nPages = Math.ceil($scope.results.num / $scope.resPerPage)
    })

    $scope.fst = function(){
        $scope.goto(1)
    }
    $scope.last = function(){

        $scope.goto($scope.nPages)
    }
    $scope.next = function(){
        if($scope.page+1 <= $scope.nPages)
            $scope.goto($scope.page+1)
    }
    $scope.prev = function(){
        if($scope.page-1 > 0){
            $scope.goto($scope.page-1)
        }
    }
    $scope.goto = function(page){
        $scope.pages = getPageVector($scope.nPages,page,10)
        $scope.page = page
        var frm = page*$scope.resPerPage - $scope.resPerPage
        var to = page*$scope.resPerPage
        //Server request here
        results.getFromServer($scope.results.query,0,50)
        //results.set({"num":$scope.results.num,"rng":[frm,to],"page":page})
    }
};
