
type ElectionT = string ;
type ElectionPostT = string ;
type BoxT = string ;
type CandidateT = string ;

type VoteBoxDefn = {
    [index: BoxT] : {
        election : ElectionT,
        regiontype: "C"|"A",
        region : string,
        island : string,
        constit : string,
        posts : {
            [index: ElectionPostT] : number,
        },
    }
}
type ElectionDefn = {
    [index: ElectionT] : {
        description: string,
        posts: {
            [index: ElectionPostT] : {
                id: CandidateT,
                name: string,
                party: string,
            }[]
        },
        boxes: VoteBoxDefn
    }
}
type VoteBoxResult = {
    election : ElectionT,
    box : BoxT,
    votes : {
        [index: ElectionPostT] : {
            [index: CandidateT] : number
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


type ElectionEntity = {
    title: string,
    boxes_total: number,
    boxes_count: number,
    posts: {
        [index: ElectionPostT]: {
            can_vote: number,
            rem_vote: number,
            did_vote: number,
            turnout: number,
            cum_votes : {
                [index: CandidateT] : number
            },    
        }
    }
}

function EntityCreate( election: ElectionT, electionDefn: ElectionDefn ) : ElectionEntity {
    const entity: ElectionEntity = {
        title: title,
        boxes_total: 0,
        boxes_cnted: 0,
    }
    for ( const [ post, candidates ] in Object.entries( electionDefn[election] ) ) {
        const cum_votes = {} ;
        candidates.forEach( c => cum_votes[c.id] = 0 ) ;
        entity.posts[post] = {
            can_vote: 0,
            rem_vote: 0,
            did_vote: 0,
            turnout: 0,
            cum_votes: cum_votes
        }
    }
    return entity ;
}
function EntityStaticUpdate( entity: ElectionEntity, voteBox: VoteBoxDefn ) : ElectionEntity {
    entity.boxes_total++ ;
    for ( const [ post, vote_result ] of Object.entries( entity.posts ) ) {
        entity[post][can_vote] += voteBox[posts][post] ;
        entity[post][rem_vote] += voteBox[posts][post] ;
    }
    return entity ;
}
function EntityResultUpdate( entity: ElectionEntity, box: VoteBoxResult ) : void {
    entity.boxes_cnted++;
    for ( const [ post, candidates ] of Object.entries( box.votes ) ) {
        let voted = 0 ;
        for ( const [ candidate, votes ] of Object.entries( candidates ) ) {
            entity[post][candidate] += votes ;
            voted += votes ;
        }
        entity[post][did_vote] += voted ;
        entity[post][rem_vote] -= voted ;
        entity[post][turnout] = Turnout( entity[post][did_vote], entity[post][can_vote] ) ;
    }
}


function createModel() : void {
    const store = window.sessionStorage ;
    const electionDefn : ElectionDefn = JSON.parse( store.getItem( KEY_ELECTION ) ) as ElectionDefn ;
    const voteBoxes : VoteBox[] = JSON.parse( store.getItem( KEY_BOXES ) ) as VoteBox[] ;
    const model = {} ;
    for ( const vb of voteBoxes ) {
        if ( !model.hasOwnProperty( vb.election ) ) model[vb.election] = EntityCreate( vb.election, electionDefn ) ; 
        const election = EntityStaticUpdate( model[vb.election], vb ) ;
        if ( !election.hasOwnProperty( vb.regiontype ) ) election[vb.regiontype] = EntityCreate( vb.regiontype, electionDefn ) ; 
        const regiontype = EntityStaticUpdate( election[vb.regiontype], vb ) ;
        if ( !regiontype.hasOwnProperty( vb.region ) ) regiontype[vb.region] = EntityCreate( vb.region, electionDefn ) ;
        const region = EntityStaticUpdate( regiontype[vb.region], vb ) ;
        if ( !region.hasOwnProperty( vb.island ) ) region[vb.island] = EntityCreate( vb.island, electionDefn ) ; 
        const island = EntityStaticUpdate( region[vb.island], vb ) ;
        if ( !region.hasOwnProperty( vb.constit ) ) region[vb.constit] = EntityCreate( vb.constit, electionDefn ) ; 
        const constit = EntityStaticUpdate( region[vb.constit], vb ) ;
        const box = EntityCreate( vb.box, electionDefn ) ;
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


