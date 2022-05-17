
// City|Atoll => Island => Box
// Box { location, constituency, maxvotes }
// Box { [ candidate, votes ] }  


/**
 * options {
 *      box,
 *      candidate,
 *      votes,
 * }
 */
$.widget( "rm.BoxCard", {

    _create: function( boxref ) {
        // get box location, votes
        const location = 'location' ;
        const eligible_votes = 0 ;
        const title = `<div class="w3-panel">Box ${boxref} - ${eligible_votes} voters.<br/>Location ${location}</div>` ;
        this._setOption( "title", title ) ;
        const candidates = `<div class="w3-panel"> ... waiting </div>` ;
        const candidate =`<div class="w3-panel w3-quarter"><img src="path/to/candidate/image/--.jpg" class="w3-round"</div><div class="w3-panel w3-rest"><span class="w3-tag w3-large">--%</span> -- votes.</div>` ;
        this.options.value = this._constrain(this.options.value);
        this.element.addClass( "progressbar" );
        this.refresh();
    },

    refresh: function() {
        var progress = this.options.value + "%";
        this.element.text( progress );
        if ( this.options.value == 100 ) {
            this._trigger( "complete", null, { value: 100 } );
        }
    },
    _constrain: function( value ) {
        if ( value > 100 ) {
            value = 100;
        }
        if ( value < 0 ) {
            value = 0;
        }
        return value;
    },
    _destroy: function() {
        this.element
            .removeClass( "progressbar" )
            .text( "" );
    }
});