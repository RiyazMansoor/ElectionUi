
// City|Atoll => Island => Box
// Box { location, constituency, maxvotes }
// Box { [ candidate, votes ] }  



const CONSTITHTML = `
<div class="w3-panel">Constituency: $$ ( $$ )</div>
<div class="w3-panel">Boxes: $$/$$, Voters: $$/$$.</div>
<div class="w3-panel"> ...waiting </div>

` ;
const BOXHTML = `
<div class="w3-panel">Box: $box. Voters: $did_vote/$can_vote.<br/>Constituency: $constit, Location: $city$atoll, $island.</div>
<div class="w3-panel"> ...waiting </div>
` ;
const CANDIDATEHTML = `
<div class="w3-row">
  <div class="w3-panel w3-quarter"><img src="constant/path/$candidate.jpg" class="w3-round"</div>
  <div class="w3-panel w3-rest"><span class="w3-tag w3-large">$percent%</span> $votes votes.</div>
</div>
` ;

function replaceVars( str, obj ) {
    obj.keys().forEach( k => obj[k] = ( obj[k] == null ? "" : obj[k] ) ) ;
    return obj.keys().reduce( ( pv, cv ) => pv.replace( "$"+cv, obj[cv] ), str ) ;
}

$.widget( "rm.BoxCard", {
    _create: function( boxDbRef ) {
        this.option( "ref", boxDbRef ) ;
        const refs = this.refreshBox() ;
    },
    refreshBox: function( did_vote = 0 ) {
        const boxDbRef = this.option( "ref" ) ;
        // get box location, votes
        const city, atoll, island, constit, can_vote ;
        const dbRefs = {
            box: boxDbRef,
            city: city,
            atoll: atoll,
            island: island, 
            constit: constit,
            did_vote: did_vote,
            can_vote: can_vote,
        }
        this.option( "refs", refs ) ;
        return dbRefs ;
    },
    _setOption: function( key, value ) {
        // value: [ { candidate, votes } ] 
        // candidate 0 is invalid votes.
        if ( key == "votes" ) {
            const did_vote = value.reduce( ( pv, cv ) => pv + cv.votes, 0 ) ;
            const refs = this.refreshBox( did_vote ) ;
            value.sort( ( a, b ) => a.votes - b.votes ) ;
            value.forEach( v => v.percent = Number(100*v.votes/refs.did_vote).toFixed(1) ) ;
            const candidates = value.reduce( ( pv, cv ) => pv + replaceVars( CANDIDATEHTML, cv ), "" ) ;
            this.element.html( $( replaceVars( BOXHTML, refs ) ).find( "div:eq(1)" ).html( candidates ) ) ;
        }
        this._super( key, value ) ;
    },
    _destroy: function() {
        this.element.text( "" );
    }
} ) ;

$.widget( "rm.ConstituencyCard", {
    _create: function( constitDbRef ) {
        this.option( "ref", constitDbRef ) ;
        this.refresh() ;
    },
    refreshDb: function() {
        const constitDbRef = this.option( "ref" ) ;
        // get box location, votes
        const city, atoll, constit, can_vote ;
        const dbRefs = {
            box: boxDbRef,
            city: city,
            atoll: atoll,
            constit: constit,
            did_vote: 0,
            can_vote: can_vote,
        }
        this.option( "dbRefs", dbRefs ) ;
        this.element.html( replaceVars( BOXHTML, dbRefs) ) ;        
    },
    _setOption: function( key, value ) {
        if ( key === "votes" ) {
            // box top
            value.sort( ( a, b ) => a.votes - b.votes ) ;
            const vars = this.option( "vars" ) ;
            vars[1] = value.reduce( ( pv, cv ) => pv + cv, 0 ) ;
            this.option( "vars", vars ) ;
            let content = vars.reduce( ( pv, cv ) => pv.replace( "$$", cv ), BOXHTML ) ;
            // box candidates
            const candidates = value.map( c => [ c.candidate, Number(c.votes/vars[1]).toFixed(1), c.votes ] )
                                    .reduce( ( pv, cv ) => pv.replace( "$$", cv ), CANDIDATEHTML ) ;
            this.element.text( $( content ).find( "div:eq(1)" ).html( candidates ) ) ;
        }
        this._super( key, value ) ;
    },
    _destroy: function() {
        // this.element.text( "" );
    }
} ) ;

