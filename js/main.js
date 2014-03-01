var app = angular.module('app', ['ui.bootstrap','ngGrid'])
var webroot = ""
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
            $.getJSON(webroot+"/query?q="+queryJSON+"&r="+frm+"%%"+to,function(data){
                console.log("Got results from server")
                results = data
                $rootScope.$broadcast("resultsChanged",data)
            })
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
        results.getFromServer(qstring.join("^").toUpperCase(),0,50)
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

var resCtrl = function($scope,results) {

    putChart([])
    $scope.results = { "num":0,"rng":[1,5],"query":"NONE","res":[] } ;
    $scope.showRes = false;
    $scope.$on('resultsChanged',function(event,res){
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

    $scope.totalItems = $scope.results.num;
    $scope.itemsPerPage = 50;
    $scope.currentPage = 0;
    $scope.maxSize = 5;

    $scope.$on('resultsChanged', function(event,res){
        $scope.results = res
        $scope.nPages = Math.ceil($scope.results.num / $scope.resPerPage)
        $scope.totalItems = $scope.results.num;
        $scope.currentPage = Math.floor($scope.results.rng[0]/$scope.itemsPerPage)+1
	$scope.$apply()
    })

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        results.getFromServer($scope.results.query,(pageNo-1)*$scope.itemsPerPage,pageNo*$scope.itemsPerPage)

    };
    $scope.$watch("currentPage", function(){
	if(!$scope.currentPage == 0)
            $scope.setPage($scope.currentPage)
    })




};

//Grid with pagination for results
app.controller('GridCtrl', function($scope, $http, results) {
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [5, 10, 20],
        pageSize: 5,
        currentPage: 1
    };
    $scope.setPagingData = function(data, page, pageSize){
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                //where the query goes
                console.log("")
                $http.get('js/largeLoad.json').success(function (largeLoad) {
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });
            } else {
                $http.get('js/largeLoad.json').success(function (largeLoad) {
                    $scope.setPagingData(largeLoad,page,pageSize);
                });
            }
        }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.gridOptions = {
        data: 'myData',
        enablePaging: true,
        showFooter: true,
        totalServerItems:'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };
});
