
type ElectionKey = string ;
type PostKey = string ;
type BoxKey = string ;
type CandidateKey = string ;
type CanVoteT = number ;
type DidVoteT = number ;

type VoteBoxDefn = {
    [index: BoxKey] : {
        election : ElectionKey,
        regiontype: "C"|"A",
        region : string,
        island : string,
        constit : string,
        posts : {
            [index: PostKey] : CanVoteT,
        },
    }
}
type ElectionDefn = {
    [index: ElectionKey] : {
        description: string,
        posts: {
            [index: PostKey] : {
                id: CandidateKey,
                name: string,
                party: string,
            }[]
        },
        boxes: VoteBoxDefn
    }
}
type VoteBoxResult = {
    election : ElectionKey,
    box : BoxKey,
    votes : {
        [index: PostKey] : {
            [index: CandidateKey] : DidVoteT
        }
    }
}

const URL_ElectionDefn  = "" ;
const URL_VoteBoxResult = "" ;

function fetchFailure( e ) {
    console.error( e ) ;
}

function fetchElectionDefnSuccess( data: ElectionDefn ) : void {
    window.sessionStorage.setItem( URL_ElectionDefn, JSON.stringify( data ) ) ;
}
function fetchElectionDefn(): void {
    $.getJSON( URL_ElectionDefn, fetchElectionDefnSuccess, fetchFailure ) ;
}

function fetchVoteBoxResultSuccess( data: VoteBoxResult ) : void {
    window.sessionStorage.setItem( URL_VoteBoxResult, JSON.stringify( data ) ) ;
}
function fetchVoteBoxResult(): void {
    $.getJSON( URL_VoteBoxResult, fetchVoteBoxResultSuccess, fetchFailure ) ;
}


type AggregateT = {
    title: string,
    boxes_total: number,
    boxes_count: number,
    posts: {
        [index: PostKey]: {
            can_vote: CanVoteT,
            rem_vote: number,
            did_vote: DidVoteT,
            turnout: number,
            cum_votes : {
                [index: CandidateKey] : DidVoteT
            },    
        }
    }
}

function CreateAggretate( election: ElectionKey, electionDefn: ElectionDefn ) : AggregateT {
    const aggr: AggregateT = {
        title: title,
        boxes_total: 0,
        boxes_cnted: 0,
    }
    for ( const [ post, candidates ] in Object.entries( electionDefn[election] ) ) {
        const cum_votes = {} ;
        candidates.forEach( c => cum_votes[c.id] = 0 ) ;
        aggr.posts[post] = {
            can_vote: 0,
            rem_vote: 0,
            did_vote: 0,
            turnout: 0,
            cum_votes: cum_votes
        }
    }
    return aggr ;
}
function BuildAggretate( aggr: AggregateT, voteBox: VoteBoxDefn ) : AggregateT {
    aggr.boxes_total++ ;
    for ( const [ post, vote_result ] of Object.entries( aggr.posts ) ) {
        aggr[post][can_vote] += voteBox[posts][post] ;
        aggr[post][rem_vote] += voteBox[posts][post] ;
    }
    return aggr ;
}
function aggrResultUpdate( aggr: AggregateT, box: VoteBoxResult ) : void {
    aggr.boxes_cnted++;
    for ( const [ post, candidates ] of Object.entries( box.votes ) ) {
        let voted = 0 ;
        for ( const [ candidate, votes ] of Object.entries( candidates ) ) {
            aggr[post][candidate] += votes ;
            voted += votes ;
        }
        aggr[post][did_vote] += voted ;
        aggr[post][rem_vote] -= voted ;
        aggr[post][turnout] = Turnout( aggr[post][did_vote], aggr[post][can_vote] ) ;
    }
}


function createModel() : void {
    const store = window.sessionStorage ;
    // TODO
    const electionDefn : ElectionDefn = JSON.parse( store.getItem( KEY_ELECTION ) ) as ElectionDefn ;
    const voteBoxes : VoteBox[] = JSON.parse( store.getItem( KEY_BOXES ) ) as VoteBox[] ;
    const model = {} ;
    for ( const vb of voteBoxes ) {
        if ( !model.hasOwnProperty( vb.election ) ) model[vb.election] = CreateAggretate( vb.election, electionDefn ) ; 
        const election = BuildAggretate( model[vb.election], vb ) ;
        if ( !election.hasOwnProperty( vb.regiontype ) ) election[vb.regiontype] = CreateAggretate( vb.regiontype, electionDefn ) ; 
        const regiontype = BuildAggretate( election[vb.regiontype], vb ) ;
        if ( !regiontype.hasOwnProperty( vb.region ) ) regiontype[vb.region] = CreateAggretate( vb.region, electionDefn ) ;
        const region = BuildAggretate( regiontype[vb.region], vb ) ;
        if ( !region.hasOwnProperty( vb.island ) ) region[vb.island] = CreateAggretate( vb.island, electionDefn ) ; 
        const island = BuildAggretate( region[vb.island], vb ) ;
        if ( !region.hasOwnProperty( vb.constit ) ) region[vb.constit] = CreateAggretate( vb.constit, electionDefn ) ; 
        const constit = BuildAggretate( region[vb.constit], vb ) ;
        const box = CreateAggretate( vb.box, electionDefn ) ;
        island[vb.box] = box ;
        constit[vb.box] = box ;
    }
}
function updateModel() : void {
    const store = window.sessionStorage ;
    const vbr : VoteBoxResult[] = JSON.parse( store.getItem( KEY_RESULTS ) ) as VoteBoxResult[] ;

}



function Turnout( did_vote: number, can_vote: number ) : number {
    return Number( 100 * did_vote / can_vote ).toFixed( 1 ) ;
}


