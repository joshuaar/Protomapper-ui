/**
 * @jsx React.DOM
 */


/**
 * Props:
 *
 * @type {*}
 */
MainPage = React.createClass({
    handleSubmit: function(queryCmds){
       // queryCmds = {"queryCmds":{"patterns":["ASD"],"organisms":["porg2"]},"dbs":{"1":false,"2":false}}
        //{query:["AVH"], range:[0,10], db:[], orgsList:[]}
        var query = {}
        console.log(queryCmds.queryCmds)
        query.query=queryCmds.queryCmds.patterns
        query.range = [0,10]
        var dbs = []
        for(i in queryCmds.dbs){
            if(queryCmds.dbs[i])
                dbs.push(i)
        }
        query.db=dbs
        if(queryCmds.queryCmds.hasOwnProperty("organisms")){
            query.orgsList = queryCmds.queryCmds.organisms
        } else {
            query.orgsList = []
        }

        this.setState({queryJSON:query})

    },
    render: function(){
        if(!this.state){
            return(
                <div className="InputContainer">
                    <h1>Protomapper Search</h1>

                    <hr />
                    <p>
                    Welcome to Protomapper Search. This service searches UniprotKB for regular expressions.
                See the
            <a href="about.html"> About section </a>
            for features and query syntax, and <a href="http://github.com/joshuaar/Protomapper-Serve">Github</a> for sources and documentation.
            </p>

                <InputPage orgsURL={orgsURL} dbURL={dbURL} handleSubmit={this.handleSubmit}/>

                </div>

                )
        }
        else {
            return (
                <div>
                    <div className="InputContainer">
                        <h1>Protomapper Search</h1>

                        <hr />
                    </div>
                    <div className="ResultsContainer">
                        <ResultsPage queryJSON={this.state.queryJSON} nPerPage={10} request={request}/>
                    </div>
                </div>
                )
        }
    }
})

var testComponents = function(){
    var qjson = {query:["AVH"], range:[0,10], db:[], orgsList:[]}
    React.renderComponent(
        <MainPage />

        ,
        document.getElementById('MainPage')
    );
}

testComponents()
