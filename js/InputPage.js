/**
 * @jsx React.DOM
 */

var fieldURL = function(field){return "/terms?field="+field}
var orgsURL = fieldURL("org")
var dbURL = fieldURL("db")

/**
 * Props:
 *  orgsURL: String
 *  dbURL: String
 * state:
 *  orgsItems: fetch with ajax
 *  dbItems: fetch with ajax
 * @type {*}
 */
var InputPage = React.createClass({
    getInitialState: function(){
        return (
                {
                    orgsItems: [],
                    dbItems: []
                }
            )
    },
    componentDidMount: function() {
        console.log("getting AJAX")
        comp = this
        $.get(comp.props.dbURL, function(result){
            $.get(comp.props.orgsURL, function(result2){
                var newOrgsList = JSON.parse(result2)
                var newDBList = JSON.parse(result).map(function(i){
                    return {displayName:i, id:i}
                })
                var newState = {orgsItems: newOrgsList, dbItems:newDBList}
                comp.setState(newState)
            })


        })
    },
    render: function() {
        console.log(this.state)
        var nThings = this.state.orgsItems.length + this.state.dbItems.length
        return (
            <div>
                <searchDialog key={"SD-"+nThings} orgData={this.state.orgsItems} dbData={this.state.dbItems}/>
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
        <InputPage orgsURL={orgsURL} dbURL={dbURL}/>
        ,
        document.getElementById('InputPage')
    );
}

testComponents()