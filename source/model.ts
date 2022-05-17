
type VoteBox = {
    regiontype: "C"|"A",
    region : string,
    island : string,
    constit : string,
    box : string,
    can_vote : number,
}
type CandidateVote = {
    candidate : number,
    votes : number,
    percent? : number
}
type CandidatesVotes = {
    [index: string] : number
}
type BoxResult = {
    box : string,
    did_vote : number,
    candidate_votes : CandidateVotes[]
}

const URL_BOXES = "" ;
const KEY_BOXES = "" ;

const URL_RESULTS = "" ;
const KEY_RESULTS = "" ;

function fetchFailure( e ) {
    console.error( e ) ;
}

function fetchBoxesSuccess( data: VoteBox[] ) {
    window.sessionStorage.setItem( KEY_BOXES, JSON.stringify( data ) ) ;
}
function fetchBoxes(): VoteBox[] {
    $.getJSON( URL_BOXES, fetchSuccess, fetchFailure ) ;
}

function fetchResultsSuccess( data: VoteResult[] ) {
    data.forEach( box => {
        box.did_vote = box.result.reduce( ( total_votes, candidate ) => total_votes + candidate.votes, 0 ) ;
        box.result.sort( ( box1, box2 ) => box1.votes - box2.votes ) ;
        box.result.forEach( candidate => candidate.percent = Number(candidate.votes/box.did_vote).toFixed(1) ) ;        
    } ) ;
    window.sessionStorage.setItem( KEY_RESULTS, JSON.stringify( data ) ) ;
}
function fetchResults(): VoteBox[] {
    $.getJSON( URL_RESULTS, fetchSuccess, fetchFailure ) ;
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

