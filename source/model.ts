
type VoteBoxDefn = {
    boxid       : string,
    can_vote    : number,
    candidates  : number[],
}

type ConstituencyDefn = {
    id          : string,
    parent      : string,
    boxes       : string[],
}

type VoteBox = {
    election : string,
    atolltype : "C"|"A", 
    atoll : string,
    island : string,
    constit : string,
    box : string,
    can_vote : number,
    candidates  : number[],
}
type VoteBoxResult = {
    box : string,
    votes : {
        [index: number] : number
    }
}

const URL_BOXES = "" ;
const KEY_BOXES = "" ;

const URL_RESULTS = "" ;
const KEY_RESULTS = "" ;

function fetchFailure( e ) {
    console.error( e ) ;
}

function fetchBoxesSuccess( data: VoteBox[] ) : void {
    window.sessionStorage.setItem( KEY_BOXES, JSON.stringify( data ) ) ;
}
function fetchBoxes(): void {
    $.getJSON( URL_BOXES, fetchSuccess, fetchFailure ) ;
}

function fetchResultsSuccess( data: VoteBoxResult[] ) : void {
    window.sessionStorage.setItem( KEY_RESULTS, JSON.stringify( data ) ) ;
}
function fetchResults(): void {
    $.getJSON( URL_RESULTS, fetchSuccess, fetchFailure ) ;
}

function updateStaticModel() : void {
    const store = window.sessionStorage ;
    const voteBoxes : VoteBox[] = JSON.parse( store.getItem( KEY_BOXES ) ) as VoteBox[] ;
    const model = {} ;
    for ( const vb of voteBoxes ) {
        if ( !model.hasOwnProperty( vb.election ) ) model[vb.election] = {} ;
        const election = model[vb.election] ;
        if ( election.hasOwnProperty( vb.atoll ) ) election[vb.atoll] = {} ;
        const atoll = election[vb.atoll] ;
        if ( atoll.hasOwnProperty( vb.island ) ) atoll[vb.island] = {} ;
        const island = atoll[vb.island] ;
        if ( atoll.hasOwnProperty( vb.constit ) ) atoll[vb.constit] = {} ;
        const constit = atoll[vb.constit] ;
        if ( island.hasOwnProperty( vb.box ) ) island[vb.box] = {} ;
        if ( constit.hasOwnProperty( vb.box ) ) constit[vb.box] = {} ;
        
    }

    const boxes : { [index: string] : [ VoteBox, VoteBoxResult ] }  = {},
          islands : { [index: string] : Box[] }  = {},
          constits : { [index: string] : Box[] }  = {}, 
          atollislands : { [index: string] : Island[] }  = {}, 
          atollconstits : { [index: string] : Constituency[] }  = {}, 
          cityislands : { [index: string] : Island[] }  = {}, 
          cityconstits : { [index: string] : Constituency[] }  = {}, 
    ;
    voteBoxes.forEach( vb => {
        boxes[vb.box] = [ vb, null ] ;
        islands[vb.island] = [] ;
        constits[vb.constit] = [] ; 
        atolls[vb.atoll] = [] ;
        cities[vb.city] = [] ;
    } ) ;
    const boxEs : Box[] = [],
          islandEs : Island[],
          constitEs : Constituency[] ;
    boxes.forEach( box => {
        const [ vb, vbr ] = box ;
        const b = new Box( vb, vbr ) ;
        islands[vb.island].push( b ) ;
        constit[vb.constit].push( b ) ;
    } ) ;

    const islandBoxes = {}, constitBoxes = {} ;
}
function updatePage() : void {

}



function Turnout( did_vote: number, can_vote: number ) : number {
    return Number( 100 * did_vote / can_vote ).toFixed( 1 ) ;
}

abstract class Entity {

    title: string = "" ;
    child_total: number = 0 ;
    child_counted: number = 0 ;
    completed: boolean = false ;
    can_vote: number = 0 ;
    did_vote: number = 0 ;
    turnout: number = 0 ;
    votes: { [index: number] : number } = {}
 
}

class Box extends Entity {
    
    constructor( voteBox: VoteBox, voteBoxResult: VoteBoxResult ) {
        this.title = "Box: " + voteBox.box ;
        this.child_total = 1 ;
        this.can_vote = voteBox.can_vote ;
        if ( voteBoxResult ) {
            this.child_counted = 1 ;
            this.completed = true ;
            this.did_vote = Object.values( voteBoxResult.votes ).reduce( ( pv, cv ) => pv + cv, 0 ) ;
            this.turnout = Turnout( this.did_vote, voteBox.can_vote ) ;
            for ( const [ key, value ] in Object.entries( voteBoxResult.votes ) ) {
                votes[key] = value ;
            }
        }
    }

}

abstract class Aggregate extends Entity {
    
    constructor( entities: Entity[], title: string ) {
        this.title = title ;
        this.child_total = entities.length ;
        this.child_counted = entities.reduce( ( pv, cv ) => pv + cv.child_counted, 0 ) ;
        this.can_vote = entities.reduce( ( pv, cv ) => pv + cv.can_vote, 0 ) ;
        this.completed = ( this.child_total == this.child_counted ) ;
        if ( this.child_counted ) {
            this.did_vote = entities.reduce( ( pv, cv ) => pv + cv.did_vote, 0 ) ;
            this.turnout = Turnout( this.did_vote, this.can_vote ) ;
            for ( const key in entities[0].votes ) {
                this.votes[key] = 0 ;
            }
            for ( const entity of entities ) {
                for ( const [ key, valaue ] in Object.entries( entity.votes ) ) {
                    this.votes[key] += value ;
                }
            }
        }
    }

}

class Island extends Aggregate {
    constructor( boxes: Box[], island: string ) {
        super( boxes, `Island: ${constit}` ) ;
    }
}
class Constituency extends Aggregate {
    constructor( boxes: Box[], constit: string ) {
        super( boxes, `Constituency: ${constit}` ) ;
    }
}

class AtollIslands extends Aggregate {
    constructor( islands: Island[], atoll: string ) {
        super( islands, `Atoll: ${atoll} by Geography` ) ;
    }
}
class AtollConstituencies extends Aggregate {
    constructor( constits: Constituency[], atoll: string ) {
        super( constits, `Atoll: ${atoll} by Constituency` ) ;
    }
}
class CityIslands extends Aggregate {
    constructor( islands: Island[], city: string ) {
        super( islands, `City: ${city} by Geography` ) ;
    }
}
class CityConstituencies extends Aggregate {
    constructor( constits: Constituency[], city: string ) {
        super( constits, `City: ${city} by Constituency` ) ;
    }
}

class GroupedAtollIslands extends Aggregate {
    constructor( atolls: AtollIsland[] ) {
        super( atolls, "All Atolls by Geography " ) ;
    }
}
class GroupedAtollConstituencies extends Aggregate {
    constructor( atoll: AtollConstituencies[] ) {
        super( constits, "All Atolls by Constituency " ) ;
    }
}

class GroupedCityIslands extends Aggregate {
    constructor( cities: CityIslands[] ) {
        super( cities, "All Cities by Geography " ) ;
    }
}
class GroupedCityConstituencies extends Aggregate {
    constructor( cities: CityConstituencies[] ) {
        super( cities, "All Cities by Constituency " ) ;
    }
}

class OverallIslands extends Aggregate {
    constructor( cities: GroupedCityIslands, atolls: GroupedAtollIslands ) {
        super( [ cities, atolls ], "Cities and Atolls by Geography" ) ;
    }
}
class OverallConstituencies extends Aggregate {
    constructor( cities: GroupedCityConstituencies, atolls: GroupedAtollConstituencies ) {
        super( [ cities, atolls ], "Cities and Atolls by Constituency" ) ;
    }
}

}


function fetchProcess() {
    const store = window.sessionStorage ;
    const boxes : VoteBox[] = JSON.parse( store.getItem( KEY_BOXES ) ) as VoteBox[] ;
    const voteResults : VoteResult[] = JSON.parse( store.getItem( KEY_RESULTS ) ) as VoteResult[] ;
    // compute overall
    const overallVote: OverallVote = {
        box_voted : results.length,
        box_total : boxes.length,
        results : [] 
    }
    for ( const result of voteResults ) {
        addResult( result, result.overallResult.results ) ;
    }


}


function addResult( from : CandidateVote[][], to : CandidateVote[] ) : number {
    // ensure "to" contains all required candidates
    const candidates : Set<string> = new Set( from[0].map( c => c.candidate ) ) ;
    const objVotes : CandidateVotes = objFromCandidateVote( candidates ) ;
    // add up
    for ( const candidateVoteArray of from ) {
        for ( const candidateVote of candidateVoteArray ) {
            objVotes[candidateVote.candidate] += candidateVote.votes ;
        }
    }
    // return
    objToCandidateVotes( objVotes, to ) ;
    return properCandidateVotes( to ) ;        
}

function objFromCandidateVote( candidates : Set<string> ) : CandidatesVotes {
    const objVotes = {} ;
    for ( const candidate of candidates ) {
        objVotes[candidate] = 0 ;
    }
    return objVotes ;
}
function objToCandidateVotes( obj: CandidatesVotes, candidateVotes : CandidateVote[] ) {
    for ( const candidate in obj ) {
        const candidateVote: CandidateVote = candidateVotes.find( c => c.candidate == candidate ) ;
        if ( !candidateVote ) {
            candidateVotes.push( {
                candidate: candidate,
                votes : obj[candidate]
            } ) ;
        } else {
            candidateVote.votes += obj[candidate] ;
        }
    }
}

function properCandidateVotes( candidateVotes : CandidateVote[] ) : number {
    const did_vote : number = candidateVotes.reduce( ( total_votes, candidateVote ) => total_votes + candidateVote.votes, 0 ) ;
    candidateVotes.sort( ( candidateVote1, candidateVote2 ) => candidateVote2.votes - candidateVote1.votes ) ;
    candidateVotes.forEach( candidateVote => candidateVote.percent = Number(candidateVote.votes/did_vote).toFixed(1) ) ;        
    return did_vote ;
}


