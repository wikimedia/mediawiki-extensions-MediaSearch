var $ = require( 'jquery' );

/* global jest:false */
var mw;

function Api() {}
Api.prototype.get = jest.fn().mockReturnValue( $.Deferred().resolve().promise() );
Api.prototype.post = jest.fn().mockResolvedValue( {} );
Api.prototype.getToken = jest.fn().mockResolvedValue( {} );
Api.prototype.postWithToken = jest.fn().mockResolvedValue( {} );

function Title() {}
Title.prototype.getMainText = jest.fn().mockReturnValue( '' );
Title.prototype.getName = jest.fn().mockReturnValue( '' );
Title.prototype.getNamespaceId = jest.fn().mockReturnValue( 0 );
Title.prototype.getNamespacePrefix = jest.fn().mockReturnValue( '' );
Title.newFromText = jest.fn().mockReturnValue( {
	fragment: null,
	namespace: 0,
	title: '',
	getMainText: jest.fn().mockReturnValue( 'mock' ),
	getName: jest.fn().mockReturnValue( 'mock' ),
	getExtension: jest.fn().mockReturnValue( 'mock' )
} );

mw = {
	Api: Api,
	config: {
		get: jest.fn()
	},
	message: jest.fn().mockReturnValue( {
		text: jest.fn(),
		parse: jest.fn(),
		params: jest.fn( () => mw.message() )
	} ),
	msg: jest.fn().mockReturnValue( '' ),
	Uri: jest.fn().mockReturnValue( {
		getQueryString: jest.fn(),
		query: {
			type: ''
		}
	} ),
	Title: Title,
	util: {
		parseImageUrl: jest.fn().mockReturnValue( {
			resizeUrl: jest.fn()
		} )
	},
	language: {
		convertNumber: jest.fn()
	}
};
/*
 * MW front-end code expects certain global variables to exist in the
 * environment. This sets up things like "mw" object, jquery, etc. for use
 * in tests.
 */
global.mw = mw;
global.$ = require( 'jquery' );
