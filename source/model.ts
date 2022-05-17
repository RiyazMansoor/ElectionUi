
type VoteBox = {
    regiontype: "C"|"A",
    region : string,
    island : string,
    constit : string,
    box : string,
    can_vote : number,
}
type Result = {
    candidate : number,
    votes : number,
    percent? : number
}
type VoteResult = {
    box : string,
    did_vote : number,
    result : Result[]
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


type OverallResult = {
    box_voted : number,
    box_total : number,
    result : Result[] 
}
type Regions = {
    name: string,

}


function fetchProcess() {
    const boxes: VoteBox[] = window.sessionStorage.getItem( KEY_BOXES ) as VoteBox[] ;
    const results: VoteResult[] = window.sessionStorage.getItem( KEY_RESULTS ) as VoteResult[] ;
    // compute overall
    const overallResult: OverallResult = {
        box_voted : results.length,
        box_total : boxes.length,
        result : [] 
    }


}


function addResult( from : Result, to : Result ) {
    for ( const prp in from ) {
        if ( !( prp in to ) ) to.prp = 0 ;
        to.prp += from.prp ;
    }
}