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
            this.setState( {display:this.props.field, trimmed:false} )
        if(!this.state.trimmed)
            this.setState( this.getInitialState())

    },

    render: function() {

        return (
            <td className="resultBox" style={this.props.style} onClick={this.handleClick}>
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
            this.setState( {display:this.props.seq, trimmed:false} )
        if(!this.state.trimmed)
            this.setState( this.getInitialState())

    },

    render: function() {

        var highlightRegex = function(item,regex) {
            var re = new RegExp("(" + regex + ")", "gi") ;
            var t = item.replace(re,"<b style='color:red'>$1</b>");
            var t = <div dangerouslySetInnerHTML={{__html: t}} />
            return t
        }

        return (

            <td onClick={this.handleClick}>
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
                width:"100px",
                fontSize:".7em"
               // height:"40px"
            },
            seqStyle:{
                width:"400px",
                fontFamily:"monospace"
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
 *   rows: [{},...]
 *   query: ""
 *   headers: []
 */
var resultTable = React.createClass({

    render: function() {
        var comp = this
        var tableHeaders = this.props.headers.map(function(i){
            return(
                <td>
                    {i}
                </td>
                )
        })

        var tableRows = this.props.rows.map( function(rowData) {
            return (<resultRow row={rowData} query={comp.props.query} />)
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

var seqTest = "AVHADHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAVHADHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDFAVHAHAHAHAFAFAFAFYVYVYVYVYDFDFDFDFDF"
var result = {seq:seqTest,acc:"YPGAKKASDKG",org:"Porginizm34",desc:"porganism dsecription asdasdasdasd asdasdasdasdasd asdasdasd",db:"customDB"}
var query = "AVHAD"
var header = ["Accession","Organism","Sequence","Description","Database"]


var testResultComponents = function(){
    React.renderComponent(
        <div>
            <resultSequenceCol seq={seqTest} optRegex={"AVHAD"} />
            <br />
            <table>
                <resultRow row={result} query={"AVHAD"} />
            </table>
            <resultTable rows={[result,result,result]} query={"AVHAD"} headers={header} />
        </div>


        ,
        document.getElementById('ResultsComponentTest')
    );
}

testResultComponents()