'use strict';

module.exports = function ( grunt ) {
	const conf = grunt.file.readJSON( 'extension.json' );
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-stylelint' );

	grunt.initConfig( {
		eslint: {
			options: {
				cache: true,
				fix: grunt.option( 'fix' )
			},
			all: '.'
		},
		stylelint: {
			options: {
				cache: true
			},
			all: [
				'**/*.{less,vue}',
				'!node_modules/**',
				'!vendor/**',
				'!lib/**'
			]
		},
		banana: conf.MessagesDirs
	} );

	grunt.registerTask( 'test', [ 'eslint', 'stylelint', 'banana' ] );
	grunt.registerTask( 'default', 'test' );
	grunt.registerTask( 'fix', () => {
		grunt.config.set( 'eslint.options.fix', true );
		grunt.task.run( 'eslint' );
	} );
};
