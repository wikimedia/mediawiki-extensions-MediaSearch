/**
 * @file searchResultTimeBased.js
 *
 * Additional computed properties that are useful for time-based media (video
 * and audio files)
 */

module.exports = {
	computed: {
		/**
		 * @return {number|null}
		 */
		duration: function () {
			if ( this.imageinfo && this.imageinfo[ 0 ].duration ) {
				return Math.round( this.imageinfo[ 0 ].duration );
			} else {
				return null;
			}
		},

		/**
		 * @return {string|null}
		 */
		formattedDuration: function () {
			if ( this.duration ) {
				const hours = Math.floor( this.duration / 3600 );
				const minutes = Math.floor( ( this.duration % 3600 ) / 60 );
				const seconds = this.duration % 60;
				return ( hours ? hours + ':' : '' ) +
					( minutes < 10 ? '0' : '' ) + minutes +
					':' +
					( seconds < 10 ? '0' : '' ) + seconds;
			} else {
				return null;
			}
		},

		/**
		 * @return {string|undefined}
		 */
		mime: function () {
			return this.imageinfo[ 0 ].mime;
		}
	}
};
