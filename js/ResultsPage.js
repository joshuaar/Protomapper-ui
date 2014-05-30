/**
 * @jsx React.DOM
 */

var request = function(queryJSON, callback) {
    var url = "/query?"+"q="+queryJSON.query.join("^")+"&r="+queryJSON.range.join()+"&db="+queryJSON.db.join()+"&orgs="+queryJSON.orgsList.join()
    $.get(url,function(result){
        callback(result)
    })
}

/**
 * Creates download url from query json representation
 * @param queryJSON
 */
var dlURL = function(queryJSON){
    return "/download?"+"q="+queryJSON.query.join("^")+"&db="+queryJSON.db.join()+"&orgs="+queryJSON.orgsList.join()
}

var summaryURL = function(queryJSON){
    return "/summary?"+"q="+queryJSON.query.join("^")+"&db="+queryJSON.db.join()+"&orgs="+queryJSON.orgsList.join()
}

/**
 * Props:
 *  queryJSON : {query:Array, db:Array, orgList:Array, range:Array}  {query:["AVH"], range:[0,10], db:[], orgsList:[]}
 * @type {*}
 */
var ResultsGraph = React.createClass({
    componentDidMount: function(){
        $.get(summaryURL(this.props.queryJSON),function(results){
            res = JSON.parse(results)
            this.setState({results:res})
        }.bind(this))
    },
    render: function(){
        var loadingHTML = <div>
            <img src="img/ajax-loader.gif" />
        </div>
        if(!this.state){
            return loadingHTML
        }
        else if(this.state.hasOwnProperty("results")) {
            return (
                <PieGraph data={this.state.results} title="" />
                )
        }
        else {
            return loadingHTML
        }
    }
})

/**
 * Props (Informational only, pasted from ResultsComponents.js):
 *  getPagedData(page,nPerPage,callback)
 *  nTotal: int
 *  nPerPage: Int
 *  nPagesToDisplay: Int
 * state:
 *  data: the table data
 *  page: the current page
 * @type {*}
 */

/**
 * Props:
 *  queryJSON: JSON representation of a query: {query:Array, db:Array, orgList:Array, range:Array}
 *  nPerPage: Int
 *  request: function(queryJSON, callback) -> Makes request and fires callback upon results
 *  state:
 *   getPagedData(page,nPerPage,callback)
 */
var ResultsPage = React.createClass({

    componentDidMount: function(){
        this.props.queryJSON.range = [0,this.props.nPerPage]
        this.props.request(this.props.queryJSON, function(results){
            var res = JSON.parse(results)
            nResults = res.num

            var getPagedData= function(page,nPerPage,callback){
                var start = (page - 1) * nPerPage
                var end = (page * nPerPage)
                this.props.queryJSON.range = [start,end]
                this.props.request(this.props.queryJSON, function(rawResults){
                    var header = ["Accession","Organism","Sequence","Description","Database"]
                    var rawResultsJSON = JSON.parse(rawResults)
                    //var result = {seq:seqTest,acc:"YPGAKKASDKG",org:"Porginizm34",desc:"porganism dsecription asdasdasdasd asdasdasdasdasd asdasdasd",db:"customDB"}
                    //tableData = {rows:[result,result,result,result,result,result2,result2,result2,result2,result], query:"AVHAD", headers:header}
                    var cleanResults = {rows:rawResultsJSON.res, query:rawResultsJSON.query, headers:header}
                    callback(cleanResults, page)
                })
            }.bind(this)
            this.setState({nTotal:nResults,getPagedData:getPagedData})
        }.bind(this))
    },

    render: function() {
        var loadingHTML = <div>
            <img src="img/ajax-loader.gif" />
            </div>

        if(!this.state){
            return loadingHTML
        }
        else if(this.state.hasOwnProperty("nTotal") & this.state.hasOwnProperty("getPagedData")){
            return (
                <div>
                    <ResultsGraph queryJSON={this.props.queryJSON} />
                Total Results: {this.state.nTotal}  <br />
                <a href={dlURL(this.props.queryJSON)}>download</a>
                    <pageTable getPagedData={this.state.getPagedData} nTotal={this.state.nTotal} nPerPage={this.props.nPerPage} />
                </div>
                )
        } else {
            return (
            loadingHTML
                )
        }
    }

})

var testComponents = function(){
    var qjson = {query:["AVH"], range:[0,10], db:[], orgsList:[]}
    React.renderComponent(
        <ResultsPage queryJSON={qjson} nPerPage={10} request={request}/>

               ,
        document.getElementById('ResultsPage')
    );
}

//testComponents()