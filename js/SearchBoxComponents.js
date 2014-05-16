/**
 * @jsx React.DOM
 */



/**
 * Props:
 *  orgData: List of objects   {displayName:"",id:""}
 *  dbData: List  [""]
 *  handleUserInput(queryCmds)  queryCmds = {"queryCmds":{"patterns":["ASD"],"organisms":["porg2"]},"dbs":{"1":false,"2":false}}
 */
var searchDialog = React.createClass({

    getInitialState: function() {
        var dbToggle = {}
        for(i in this.props.dbData) {
            dbToggle[this.props.dbData[i].id] = false
        }
        return {
            queryCmds: {},
            dbs: dbToggle
        }
    },


    clearQuery: function() {
        this.setState( this.getInitialState() )
    },

    /**
     *
     * @param key: the query factor
     * @param txt: the content of the query factor
     * @param index: the index of the query factor for deleting
     */
    rmFromQuery: function(key, txt, index){
        var queryBuilder = JSON.parse(JSON.stringify(this.state.queryCmds));
        console.log(key)
        queryBuilder[key].splice(index,1)
        this.setState({queryCmds: queryBuilder} )

    },

    /**
     *
     * @param key: type of query (query factor)
     * @param value: content of query
     * @returns {boolean}
     */
    addToQuery: function(key, value) {
        console.log("Adding "+value+" to "+" "+key)
        if(value.length == 0)
            return false
        var queryBuilder = JSON.parse(JSON.stringify(this.state.queryCmds));
        var wasAlreadyIn = $.inArray(value,queryBuilder[key]) >= 0
        if(queryBuilder.hasOwnProperty(key)){
            queryBuilder[key].push(value)
        } else {
            queryBuilder[key] = [value]
        }
        if(!wasAlreadyIn)
            this.setState({queryCmds: queryBuilder} )
    },

    /**
     * Props:
     *
     * @param dbID: ID of database as given by the API
     * @param dbState: the toggle state of the db
     */
    toggleDB: function(dbID, dbState) {
        var dbs = this.state.dbs
        dbs[dbID] = dbState
        this.setState({
            queryCmds: this.state.queryCmds,
            dbs: dbs
        })
    },

    submitSearch: function() {
        this.props.handleUserInput(this.state)
    }
    ,
    render: function() {
        var queryItems = {}
        console.log(JSON.stringify(this.state))
        comp = this
        var queryRender = Object.keys(this.state.queryCmds).map( function(i,ind) {
            var handler = function(index, value) {

            }
            return (
                <div>
                    <queryTagDisplay tag={ i } values={comp.state.queryCmds[i]} handleUserInput={comp.rmFromQuery} />
                </div>
                )
        } )

        var addToQueryUpper = function(key,value) {
            comp.addToQuery(key,value.toUpperCase())
        }

        return (
            <div className="inputbox" >
                <h3 className="promptext">Query pattern</h3>
                <div className="patternbox">
                    <dropdownSelection formname="patterns" handleUserInput = {addToQueryUpper} />
                </div>
                <h3 className="promptext">Organism mask</h3>
                <dropdownSelection formname="organisms" data={this.props.orgData} handleUserInput={this.addToQuery} />
                <h3>Database selection</h3>
                <checkboxSelection data={this.props.dbData} handleUserInput={this.toggleDB} />
                {queryRender}
                <hr />
                <button type="button" onClick={this.submitSearch}><h3>Search</h3></button>
            </div>


            )
    }
})


/**
 * Dropdown selector with autocomplete
 * Props:
 *  data:
 *   [org1,org2..]
 *  formname:
 *   "" - name of this form element. for collecting input additions
 *  handleUserInput:
 *   function(userString)
 */
var dropdownSelection = React.createClass({
        getDefaultProps: function() {
            return {
                formname: "",
                data: [],
                checkInput: true
            }
        },
        handleClick: function() {
          var org = this.refs.orgInput.getDOMNode().value.trim();
          var isInOrgs = $.inArray(org,this.props.data)
          var nData = this.props.data.length
          console.log("handling click from text box: "+org+" "+isInOrgs + " " + nData + " " + this.props.checkInput)

            if(isInOrgs >= 0 || nData == 0 || !this.props.checkInput){
              this.props.handleUserInput(this.props.formname,org)
              return(false)
          } else {
              return(false)
          }
        },

        render: function() {
            console.log(this.props.formname)
            return (
            <div>
                <input className="dropinput" type="text" ref="orgInput"  /> <button type="button" onClick={this.handleClick}> + </button>
            </div>
                )
        },

        //Special code to make dropdown work right

        componentDidMount: function() {
            var comp = this
            $(".dropinput").keypress(function(e){
                if(e.which == 13){
                    comp.handleClick()
                }
            })
            $.ui.autocomplete.prototype._renderItem = function( ul, item){
                var term = this.term.split(' ').join('|');
                var re = new RegExp("(" + term + ")", "gi") ;
                var t = item.label.replace(re,"<b style='color:green'>$1</b>");
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a>" + t + "</a>" )
                    .appendTo( ul );
            };

            $(this.refs.orgInput.getDOMNode()).autocomplete({
                source: this.props.data
            })
        },

        componentWillUnmount: function() {
            $(this.refs.orgInput.getDOMNode()).remove();
        }
    }
)

/**
 * Props:
 *  checkbox selector with autocomplete
 *  data: [{displayName:"",id:""},..]
 *  handleUserInput: function(targetID, targetState)
 *  targetID will be the same as "id" in data
 */
var checkboxSelection = React.createClass({

    handleChange: function(event){
        var targetID = event.target.name
        var targetState = event.target.checked
        console.log("the boxID "+targetID+" is" + (targetState ? "" : " not") +" checked")
        this.props.handleUserInput(targetID,targetState)
    },

    render: function() {
        var handler = this.handleChange
        var dbNodes = this.props.data.map(function (db) {
            return (
              <span className="checkboxText">
                <input type="checkbox" name={db.id} onChange={handler} />{db.displayName} <br />
              </span>
                )
        });
        return (
            <div className="dbSelection">
            {dbNodes}
            </div>
            )
    }
})

/**
 * Not planned for use. Just playing
 * Props:
 *
 */
var patternInput = React.createClass({

    handleAdd: function() {
        this.setState( { "patterns": this.state.patterns.concat([""]) } )
    },

    getInitialState: function() {
        return {patterns: [""]};
    },

    render: function() {
        var comp = this
        var display = comp.state.patterns.map( function(i){
            return (
                <div onClick={comp.handleAdd.bind(this)}>
                    <input type="text" className="dropinput"></input>
                    <button type="button"> + </button>
                </div>
                )
        })

        return (
            <div ref="pattlist">
            {display}
            </div>
            )
    }
})

/**
 *
 * Props:
 *  tag:""
 *  values:""
 *  handleUserInput:
 *   function(tag, value, index)
 */
var queryTagDisplay = React.createClass({

    render: function() {
        var comp = this
        var tag = this.props.tag
        var values = this.props.values.map( function(i, index) {
            var clickFun = function(){comp.props.handleUserInput(tag,i,index)}
            return (
                   <button type="button" onClick={clickFun}> (-) {i} </button>
                )
        } )

        return (
            <div>
                <h4> {tag} </h4>
                <hr />
                {values}
            </div>
            )
    }
})

var testComponents = function(){
    var dropdownTest = ["org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3","org1","porg2","zorg3"]
    var dbTest = [{"displayName":"NCBI Bacteria and Virus","id":"1"},{"displayName":"UniProtKB - JAN2014","id":2}]
    var handleQTag = function(i,v){
        console.log(i+v)
    }
    React.renderComponent(
        <div>
            <searchDialog orgData={dropdownTest} dbData={dbTest}/>
            <patternInput />
            <dropdownSelection data={dropdownTest} />
            <checkboxSelection data={dbTest} />
            <queryTagDisplay tag="testTag" values={dropdownTest} handleUserInput={handleQTag} />
        </div>
        ,
        document.getElementById('SearchBoxComponentTest')
    );
}

testComponents()