/**
 * @jsx React.DOM
 */


/**
 *
 * @param data: {orgName:count(Int)}  unsorted
 *
 * @returns {Array} Array[(OrgName,count)] sorted
 */
var sortSummary = function(data) {
    var sortable = []
    for(i in data) {
        sortable.push([i,data[i]]);
    }
    return sortable.sort( function(a,b){ return a[1] - b[1] } )
}

/**
 * Props:
 *  data: {orgName:count, ...}
 *  title: String
 * @type {*}
 */
var PieGraph = React.createClass({
    componentDidMount: function() {
        this.putChart(this.props.data)
    },
    componentWillUnmount: function() {
        d3.select(".chart svg")
            .remove();
        d3.select(".chart").append("svg")
    },
    putChart:
    /**
     *
     * @param data: {orgName:Count}
     */
    function(data){
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
            d3.select(".chart svg")
                .remove();
            d3.select(".chart").append("svg")
            var chart = nv.models.pieChart()
                .x(function(d) { return d.label })
                .y(function(d) { return d.value })
                .showLabels(false);

            d3.select(".chart svg")
                .datum(plotdata)
                .transition().duration(1200)
                .call(chart);

            return chart;
        });
    },
    render: function(){
        return(
            <div className="chart">
                <h5>{this.props.title}</h5>

                <svg></svg>
            </div>
            )
    }

})

var testData = {org1:3,org2:4,org5:10,org7:2}
var testGraphComponents = function(){
    React.renderComponent(
        <div>
            <PieGraph data={testData} title="Organism Hit Distribution" />
        </div>
        ,
        document.getElementById('GraphComponentTest')
    );
}

//testGraphComponents()