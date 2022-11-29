'use strict';

/**
 * Take in an object or array and return an array.
 *
 * Search results are delivered in different formats depending on the API used
 * to retrieve them. Since we're using one API for local searches and another
 * for pulling search results from production Commons for local development, we
 * need to normalize the format.
 *
 * @param {Array|Object} obj The object to validate
 * @return {Array}
 */
const ensureArray = function ( obj ) {
	if ( Array.isArray( obj ) ) {
		return obj;
	} else {
		return Object.keys( obj ).map( function ( key ) {
			return obj[ key ];
		} );
	}
};

module.exports = ensureArray;
