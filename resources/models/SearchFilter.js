'use strict';

/**
 * Search Filter object.
 *
 * @param {string} type Filter type key
 * @param {Array} items Item objects (with label and value properties)
 */
var SdmsSearchFilter = function ( type, items ) {
	this.type = type;
	this.items = items;
};

module.exports = SdmsSearchFilter;
