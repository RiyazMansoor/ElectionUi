
type ElectionKey = string ;
type PostKey = string ;
type BoxKey = string ;
type CandidateKey = string ;
type CanVoteT = number ;
type DidVoteT = number ;

type VoteBoxDefn = {
    election : ElectionKey,
    regiontype: "C"|"A",
    region : string,
    island : string,
    constit : string,
    box: BoxKey,
    posts : {
        [index: PostKey] : CanVoteT,
    },
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
        boxes: {
            [index: BoxKey] : VoteBoxDefn
        }
    }
}
type VotingResult = {
    [index : ElectionKey]: {
        [index : BoxKey]: {
            [index: PostKey] : {
                [index: CandidateKey] : DidVoteT
            }
        }
    }
}

const URL_ElectionDefn  = "" ;
const URL_VotingResult = "" ;
const KEY_Model = "key of model" ;


function fetchFailure( e ) {
    console.error( e ) ;
}

function fetchElectionDefnSuccess( data: ElectionDefn ) : void {
    window.sessionStorage.setItem( URL_ElectionDefn, JSON.stringify( data ) ) ;
}
function fetchElectionDefn(): void {
    $.getJSON( URL_ElectionDefn, fetchElectionDefnSuccess, fetchFailure ) ;
}

function fetchVotingResultSuccess( data: VotingResult ) : void {
    window.sessionStorage.setItem( URL_VotingResult, JSON.stringify( data ) ) ;
}
function fetchVotingResult(): void {
    $.getJSON( URL_VotingResult, fetchVotingResultSuccess, fetchFailure ) ;
}


type AggregateT = {
    title: string,
    election: ElectionKey,
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
        election: election,
        boxes_total: 0,
        boxes_cnted: 0,
    }
    for ( const [ post, candidates ] in Object.entries( electionDefn[election].posts ) ) {
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
        const post_can_vote = voteBox[posts][post] ;
        aggr[post][can_vote] += post_can_vote ;
        aggr[post][rem_vote] += post_can_vote ;
    }
    return aggr ;
}

function aggrResultUpdate( aggr: AggregateT, result: VotingResult ) : AggregateT {
    for ( const boxes of result[aggr.election] ) {
        aggr.boxes_cnted++;
        for ( const [ post, candidates ] of Object.entries( boxes) ) {
            let voted = 0 ;
            for ( const [ candidate, votes ] of Object.entries( candidates ) ) {
                aggr.posts[post][candidate] += votes ;
                voted += votes ;
            }
            aggr.posts[post][did_vote] += voted ;
            aggr.posts[post][rem_vote] -= voted ;
            aggr.posts[post][turnout] = Turnout( aggr[post][did_vote], aggr[post][can_vote] ) ;    
        }
    }
    return aggr ;
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
    store.setItem( KEY_Model, JSON.stringify( model ) ) ;
}
function updateModel( votingResult: VotingResult) : void {
    const store = window.sessionStorage ;
    const electionDefn : ElectionDefn = JSON.parse( store.getItem( KEY_ELECTION ) ) as ElectionDefn ;
    const voteBoxDefn: VoteBoxDefn = electionDefn.
    const model  = JSON.parse( store.getItem( KEY_Model ) ) ;
    for ( const [ electionKey, boxes ] of Object.entries( votingResult ) ) {
        for ( const [ boxKey, posts ] of Object.entries( boxes ) ) {
            const boxDefn: VoteBoxDefn = electionDefn[electionKey][boxKey] ;
            const election = aggrResultUpdate( model[boxDefn.electionKey], votingResult ) ;

            for ( const [ postKey, candidates ] of Object.entries( posts ) ) {
                for ( const [ candidateKey, votes ] of Object.entries( candidates ) ) {

                }
            }
        }
        const election = model[box.election] ;
    }
}



function Turnout( did_vote: number, can_vote: number ) : number {
    return Number( 100 * did_vote / can_vote ).toFixed( 1 ) ;
}


