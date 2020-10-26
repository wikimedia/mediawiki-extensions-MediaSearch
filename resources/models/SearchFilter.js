'use strict';

/**
 * Search Filter object.
 *
 * @param {string} type Filter type key
 * @param {Array} items Item objects (with label and value properties)
 */
var SdmsSearchFilter = function ( type, items ) {
	this.type = type;
	this.items = this.getProcessedItems( items );
};

SdmsSearchFilter.prototype.getProcessedItems = function ( items ) {
	var processedItems = [];

	items.forEach( function ( item ) {
		processedItems.push( {
			// eslint-disable-next-line mediawiki/msg-doc
			label: 'labelMessage' in item ? mw.msg( item.labelMessage ) : item.label,
			value: item.value
		} );
	} );

	return processedItems;
};

module.exports = SdmsSearchFilter;
