
type VoteBox = {
    election : string,
    regiontype: "C"|"A",
    region : string,
    island : string,
    constit : string,
    box : string,
    can_vote : number,
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
        super( boxes, "Island: " + island ) ;
    }
}

class Constituency extends Aggregate {
    constructor( boxes: Box[], constit: string ) {
        super( boxes, "Constituency: " + constit ) ;
    }
}

class AtollIslands extends Aggregate {
    constructor( islands: Island[], atoll: string ) {
        super( islands, "Islands of Atoll: " + atoll ) ;
    }
}
class AtollConstituencies extends Aggregate {
    constructor( constits: Constituency[], atoll: string ) {
        super( constits, "Constituencies of Atoll: " + atoll ) ;
    }
}

class CityIslands extends Aggregate {
    constructor( islands: Island[], city: string ) {
        super( islands, "Islands of City: " + city ) ;
    }
}
class CityConstituencies extends Aggregate {
    constructor( constits: Constituency[], city: string ) {
        super( constits, "Constituencies of City: " + city ) ;
    }
}

class Atoll {
    
    islands: Island[] = [];
    constits: Constituency[] = [] ;

    constructor( islands: Island[], constits: Constituency[] ) {
        islands.forEach( isle => new Island())    
    }

}


type OverallVote = {
    box_voted : number,
    box_total : number,
    voted : Voted[] 
}
type Regions = {
    name: string,

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


