/**
 * @jsx React.DOM
 */


/**
 *  Props:
 *   field: ""
 *   style: {width:x, fontFamily="y"} camel cased
 *   maxchars: int
 */
var resultCol = React.createClass({

    getInitialState: function(){
        return {display:this.trimSeq(this.props.field), trimmed:true}
    },

    trimSeq: function(seq) {
        return seq.length > this.props.maxchars ? seq.slice(0,this.props.maxchars) + " ..." : seq
    },

    handleClick: function() {
        if(this.state.trimmed)
            this.handleMouseOn()
        if(!this.state.trimmed)
            this.handleMouseOff()

    },

    handleMouseOn: function(){
        this.setState( {display:this.props.field, trimmed:false} )
    },
    handleMouseOff: function(){
      this.setState(this.getInitialState())
    },

    render: function() {

        return (
            <td className="resultBox" style={this.props.style} onMouseEnter={this.handleMouseOn} onMouseLeave={this.handleMouseOff}>
            {this.state.display}
            </td>
            )
    }
})


/**Props
 *  seq: ""
 *  optRegex: ""
 */
var resultSequenceCol = React.createClass({

    getDefaultProps: function() {
        return {
            style: {
                width:"400px",
                fontFamily: "monospace"
            }
        }
    },

    getInitialState: function(){
        return {display:this.trimSeq(this.props.seq), trimmed:true}
    },

    trimSeq: function(seq) {
        return seq.length > 80 ? seq.slice(0,80) + " ..." : seq
    },

    handleClick: function() {
        if(this.state.trimmed)
            this.handleMouseOn()
        if(!this.state.trimmed)
            this.handleMouseOff()

    },

    handleMouseOn: function(){
        this.setState( {display:this.props.seq, trimmed:false} )
    },
    handleMouseOff: function(){
        this.setState(this.getInitialState())
    },

    render: function() {

        var highlightRegex = function(item,regex) {
            var re = new RegExp("(" + regex + ")", "gi") ;
            var t = item.replace(re,"<b style='color:red'>$1</b>");
            var t = <div dangerouslySetInnerHTML={{__html: t}} />
            return t
        }

        return (

            <td onMouseEnter={this.handleMouseOn} onMouseLeave={this.handleMouseOff}>
                <div className="resultBox seqBox" style={this.props.style}>
                    {highlightRegex(this.state.display,this.props.optRegex)}
                </div>
            </td>
            )
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


/**Props
 *  row: {"seq":"", acc:"", desc:"", org:"", db:""}
 *  style: {camelCasedStyle:""}
 *  seqStyle
 *  maxchars
 */
var resultRow = React.createClass({

    getDefaultProps: function() {
        return {
            style: {
                width:"140px",
                fontSize:".7em"
               // height:"40px"
            },
            seqStyle:{
                width:"400px",
                fontFamily:"monospace",
                fontSize:".85em"

               // height:"40px"
            },
            maxchars:15
        }
     },

    handleClick: function() {
    },

    render: function() {


        return (
    <tr className="resultRow" onClick={this.handleClick}>
            <resultCol field={this.props.row.acc} style={this.props.style} maxchars={this.props.maxchars} />
            <resultCol field={this.props.row.org} style={this.props.style} maxchars={this.props.maxchars} />
            <resultSequenceCol seq={this.props.row.seq} optRegex={this.props.query} style={this.props.seqStyle} />
            <resultCol field={this.props.row.desc} style={this.props.style} maxchars={this.props.maxchars} />
            <resultCol field={this.props.row.db} style={this.props.style} maxchars={this.props.maxchars} />
    </tr>
        )

    }
})


/**
 *  Props:
 *  data: {
 *   rows: [{},...]
 *   query: ""
 *   headers: []
 *  }
 */
var resultTable = React.createClass({

    render: function() {
        var comp = this
        var tableHeaders = this.props.data.headers.map(function(i){
            return(
                <td>
                    {i}
                </td>
                )
        })

        var tableRows = this.props.data.rows.map( function(rowData,index) {
            console.log(rowData.id)
            console.log(rowData)
            return (<resultRow key={"result-"+index} row={rowData} query={comp.props.data.query} />)
        })

        return (
            <table className="resultTable">
                <tr className="tableHeader">
                {tableHeaders}
                </tr>
                {tableRows}
            </table>
            )
    }

})

/**
 * Props:
 *  getPagedData(page,nPerPage,callback)
 *  nTotal: int
 * state:
 *  data: the table data
 *  page: the current page
 * @type {*}
 */
var pageTable = React.createClass({

    getDefaultProps: function() {
        return {
            nPerPage: 50,
            nPagesToDisplay:10
        }
    },

    getInitialState: function(){
        return {
            data: {rows:[],query:"",headers:[]},
            page:1
        }
    },

    callback: function(newData, newPage){
        this.setState({data:newData, page:newPage})
        this.forceUpdate()
        console.log("new page " +newPage)
        console.log(this.state)
    },

    componentDidMount: function(){
        console.log(this.props.nPerPage)
        this.props.getPagedData(this.state.page,this.props.nPerPage,this.callback.bind(this))
    },

    handlePageChange: function(pageNo){
        this.props.getPagedData(pageNo, this.props.nPerPage, this.callback.bind(this))
    },

    render:function(){
        console.log(this.state.data.rows)
        rTableFn = function(){ return resultTable({data:this.state.data, key:"table-"+this.state.page})}.bind(this)
        return (
            <div>
                <rTableFn />
                <pager nTotal={this.props.nTotal} pageNo={this.state.page} nPerPage={this.props.nPerPage} nPagesToDisplay={this.props.nPagesToDisplay} handleUserInput={this.handlePageChange} />
            </div>
            )
    }
})

/**
 * Props:
 *  handleUserInput: function(pageNo)
 *  pageNo: int     // current page number
 *  nTotal: int     // total number of results
 *  nPerPage: int   // number of results to display on a page
 *  nPagesToDisplay: int  //number of pages to display on paginator
 *
 */
var pager = React.createClass({

    getInitialState: function() {
        var currentPage = this.props.pageNo
        console.log(this.props.pageNo)
        return this.setCurrentPageState(currentPage)
    },

    getMaxPage: function(){return Math.ceil(this.props.nTotal/this.props.nPerPage)},

    setCurrentPageState: function(pageNumber) {  //such an unholy mess. This is where new page data goes to die/get rendered
        var currentPage = parseInt(pageNumber)
        var nPerPage = parseInt(this.props.nPagesToDisplay)
        var maxPage = parseInt(this.getMaxPage())
        var possibleMax = currentPage + nPerPage - Math.ceil(0.5*nPerPage+1)
        var maxPage = Math.min( maxPage, possibleMax )
        var minPage = Math.max(currentPage - nPerPage + Math.floor(0.5*nPerPage+1)  , 1)
        if(maxPage < nPerPage & maxPage < this.getMaxPage())
            maxPage = nPerPage
        if(minPage > Math.max(this.getMaxPage() - nPerPage,1) )
            minPage = Math.max(this.getMaxPage() - nPerPage + 1,1)
        var currentPages = []
        maxPage = Math.min(minPage + nPerPage - 1,this.getMaxPage())
        for(i=minPage;i<=maxPage;i++)
            currentPages.push(i)
        console.log(currentPage)
        sliceMarginUpper = Math.ceil(0.2*nPerPage)
        sliceMarginLower = nPerPage - sliceMarginUpper

        console.log("current page: "+ currentPage)
        console.log("max page func: "+ this.getMaxPage())
        console.log("n per page: "+ nPerPage)
        console.log("min page: "+ minPage)
        console.log("max page: " + maxPage)
        return {currentPage:currentPage,currentPages:currentPages}
    },

    handleChange: function(event){ //someone clicked a pagination button
        var pageToNum = parseInt(event.target.text)
        this.props.handleUserInput(pageToNum)
        return false;
    },

    render: function() {
        comp = this
        console.log("pToDisplay: "+this.state.currentPages)
        var listItems = this.state.currentPages.map(function(i){

        return <li><a number={i} href="#" onClick={comp.handleChange}>{i}</a></li>

        })

        var gotoFirstPage = function(){this.props.handleUserInput(1); return false}
        var gotoLastPage = function(){this.props.handleUserInput(this.getMaxPage()); return false}

    return(
            <ul className="pagination">
                <li><a href="#" onClick={gotoFirstPage.bind(this)}>&laquo;</a></li>
                    {listItems}
                <li><a href="#" onClick={gotoLastPage.bind(this)}>&raquo;</a></li>
            </ul>
        )

    }
})

var seqTest = "AVHADHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAVHADHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDF"
var result = {seq:seqTest,acc:"YPGAKKASDKG",org:"Porginizm34",desc:"porganism dsecription asdasdasdasd asdasdasdasdasd asdasdasd",db:"customDB"}
var result2 = {seq:seqTest,acc:"YPGasdasdsssAKKASDKG",org:"Porginizm3asddw2344",desc:"porganism dsecription asdasNASDIGA GAGES GSEGSRR RSDHHasdasdasd asdasdasd",db:"customDB22"}

var query = "AVHAD"
var header = ["Accession","Organism","Sequence","Description","Database"]
tableData = {rows:[result,result,result,result,result,result2,result2,result2,result2,result], query:"AVHAD", headers:header}

getPagedData = function(page,nPerPage,callback) {
    var from = (page-1)*nPerPage
    var to = (page)*nPerPage
    console.log(nPerPage)
    console.log(page)
    console.log(from)
    console.log(to)
    newRows = tableData.rows.slice(from,to)
    newTableData = JSON.parse(JSON.stringify(tableData))
    newTableData.rows=newRows
    //console.log(newRows)

    callback(newTableData,page)
}

var testResultComponents = function(){
    React.renderComponent(
        <div>
            <pageTable getPagedData={getPagedData} nTotal={tableData.rows.length} nPerPage={3} />
        </div>
        ,
        document.getElementById('ResultsComponentTest')
    );
}

//testResultComponents()