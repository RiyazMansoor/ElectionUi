
type ElectionKey = string ;
type PartyKey = string ;
type PostKey = string ;
type BoxKey = string ;
type CandidateKey = string ;
type PartyKey = string ;

type CanVoteT = number ;
type DidVoteT = number ;

type Party = {
    partyKey: PartyKey,
    electionKey: ElectionKey,
    partyName: string,
    partyLogoUrl: string,
}
type Candidate = {
    candidateKey: CandidateKey,
    postKey: PostKey,
    electionKey: ElectionKey,
    candidateName: string,
    partyKey: PartyKey,

}
type Post = {
    postKey: PostKey,
    electionKey: ElectionKey,
    postName: string,
    candidates: {
        [index: CandidateKey]: Candidate,
    }
}
type Box = {
    boxKey: BoxKey,
    electionKey : ElectionKey,
    regiontype: "C"|"A",
    regionName : string,
    islandName : string,
    constitName : string,
    posts : {
        [index: PostKey] : CanVoteT,
    },
}
type Election = {
    electionKey: ElectionKey,
    description: string,
    parties: {
        [index: PartyKey]: Party,
    },
    posts: {
        [index: PostKey]: Post,
    },
    boxes: {
        [index: BoxKey] : Box
    },
}
type Elections = {
    [index: ElectionKey] : Election 
}

type Result = {
    boxKey: BoxKey,
    [index: PostKey] : {
        [index: CandidateKey] : DidVoteT
    }
}
type Results = {
    [index : ElectionKey]: {
        [index : BoxKey]: Result
    }
}


const URL_Elections = "domain/path/election.json" ;
const URL_Results   = "domain/path.result.json" ;
const KEY_Model     = "key of model" ;

function fetchFailure( e ) {
    console.error( e ) ;
}

function fetchElectionsSuccess( data: Elections ) : void {
    window.sessionStorage.setItem( URL_Elections, JSON.stringify( data ) ) ;
}
function fetchElections(): void {
    $.getJSON( URL_Elections, fetchElectionsSuccess, fetchFailure ) ;
}

function fetchResultsSuccess( data: Results ) : void {
    window.sessionStorage.setItem( URL_Results, JSON.stringify( data ) ) ;
}
function fetchResults(): void {
    $.getJSON( URL_Results, fetchResultsSuccess, fetchFailure ) ;
}

type AggPost = {
    postKey: PostKey,
    can_vote: CanVoteT,
    did_vote: DidVoteT,
    rem_vote: number,
    turnout: number,
    cum_votes : {
        [index: CandidateKey] : DidVoteT
    },    
}
type AggEntity = {
    electionKey: ElectionKey,
    uiTitle: string,
    boxes_total: number,
    boxes_counted: number,
    posts: {
        [index: PostKey]: AggPost
    }
}

function createAggregateModel( elections: Elections ) : void {
    const Regions = {
        "C": "All Cities",
        "A": "All Atolls",
    }
    const model = {} ;
    for ( const election of elections ) {
        for ( const box of election.boxes ) {
            
            if ( !model[box.electionKey] ) {
                model[box.electionKey] = CreateAggregate( election, "Overall Result" ) ; 
            }
            const electionAggEntity = BuildAggregate( model[box.electionKey], box ) ;
            
            if ( !electionAggEntity[box.regionType] ) {
                electionAggEntity[box.regionType] = CreateAggregate( election, Regions[box.regionType] ) ; 
            }
            const regionTypeAggEntity = BuildAggregate( electionAggEntity[box.regiontype], box ) ;

            if ( !regionTypeAggEntity[box.regionName] ) {
                regionTypeAggEntity[box.regionName] = CreateAggregate( election, box.regionName ) ;
            }
            const regionNameAggEntity = BuildAggregate( regiontypeAggEntity[box.region], box ) ;
            
            if ( !regionNameAggEntity[box.island] ) {
                regionNameAggEntity[box.island] = CreateAggregate( election, box.island ) ; 
            }
            const islandAggEntity = BuildAggregate( regionAggEntity[box.island], box ) ;
            
            if ( !regionAggEntity[box.constit] ) {
                regionAggEntity[box.constit] = CreateAggregate( election, box.constit ) ; 
            }
            const constitAggEntity = BuildAggregate( regionAggEntity[box.constit], box ) ;
            
            const boxAggEntity = CreateAggregate( electionDefn, box.boxKey ) ;
            BuildAggregate( boxAggEntity, box ) ;
            islandAggEntity[box.boxKey] = boxAggEntity ;
            constitAggEntity[box.boxKey] = boxAggEntity ;

        }
    }
    // save model to reuse for every results received
    window.sessionStorage.setItem( KEY_Model, JSON.stringify( model ) ) ;
}


function CreateAggregate( election: Election, uiTitle: string ) : AggEntity {
    const aggEntity: AggEntity = {
        electionKey: election.electionKey,
        uiTitle: uiTitle,
        boxes_total: 0,
        boxes_counted: 0,
    }
    for ( const [ postKey, post ] of election.posts ) {
        const cum_votes = {} ;
        post.keys().forEach( candidateKey => cum_votes[candidateKey] = 0 ) ;
        aggEntity.posts[postKey] = {
            can_vote: 0,
            rem_vote: 0,
            did_vote: 0,
            turnout: 0,
            cum_votes: cum_votes
        }
    }
    return aggEntity ;
}
function BuildAggregate( aggEntity: AggEntity, box: Box ) : AggEntity {
    aggEntity.boxes_total++ ;
    for ( const [ postKey, aggPost ] of Object.entries( aggEntity.posts ) ) {
        const post_can_vote: CanVoteT = box[posts][postKey] ;
        aggPost.can_vote += post_can_vote ;
        aggPost.rem_vote += post_can_vote ;
    }
    return aggEntity ;
}

function resultAggregateModel( results: Results ) : void {
    const store = window.sessionStorage ;
    const elections = JSON.parse( store.getItem( URL_Elections ) ) as Elections ;
    const model = JSON.parse( store.getItem( KEY_Model ) ) ;
    for ( const [ electionKey, electionResults ] of Object.entries( results ) ) {
        const electionModel = model[electionKey] ;
        for ( const [ boxKey, boxResults ] of Object.entries( electionResults ) ) {
            const box: Box = elections[electionKey].boxes[boxKey] ;
            const electionAggEntity = ResultAggregate( model[box.electionKey], boxResults, box ) ;
            const regionTypeAggEntity = ResultAggregate( electionAggEntity[box.regiontype], boxResults, box ) ;
            const regionNameAggEntity = ResultAggregate( regionTypeAggEntity[box.regionName], boxResults, box ) ;
            const islandNameAggEntity = ResultAggregate( regionNameAggEntity[box.islandName], boxResults, box ) ;
            const constitNameAggEntity = ResultAggregate( regionNameAggEntity[box.constitName], boxResults, box ) ;
            ResultAggregate( islandNameAggEntity[box.boxKey], boxResults, box ) ;
            ResultAggregate( constitNameAggEntity[box.boxKey], boxResults, box ) ;
        }
    }
    // save model to reuse for every results received
    window.sessionStorage.setItem( KEY_Model, JSON.stringify( model ) ) ;
}

function ResultAggregate( aggEntity: AggEntity, boxResult: Result, box: Box ) : AggEntity {
    aggEntity.boxes_counted++;
    for ( const [ postKey, candidates ] of Object.entries( boxResult ) ) {
        const aggPost = aggEntity.posts[postKey] ;
        for ( const [ candidateKey, candidateVotes ] of Object.entries( candidates ) ) {
            aggPost.cum_votes[candidateKey] += candidateVotes ; 
            aggPost.did_vote += candidateVotes ;
        }
        aggPost.rem_vote -= box[postKey].can_vote ;
        aggPost.turnout  = Turnout( aggPost.did_vote, aggPost.can_vote ) ;
    }
    return aggEntity ;
}


function Turnout( did_vote: number, can_vote: number ) : number {
    return Number( 100 * did_vote / can_vote ).toFixed( 1 ) ;
}


