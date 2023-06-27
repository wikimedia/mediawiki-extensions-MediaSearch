<template>
	<video
		ref="videoPlayer"
		class="sd-player video-js vjs-16-9 vjs-big-play-centered"
		:src="fallbackUrl"
		:poster="options.poster"
		controls
	></video>
</template>

<script>
// @vue/component
module.exports = exports = {
	name: 'SdPlayer',

	compatConfig: {
		MODE: 3
	},

	props: {
		options: {
			type: Object,
			default: function () {
				return {};
			}
		},

		fallbackUrl: {
			type: String,
			default: ''
		}
	},

	data: function () {
		return {
			player: null
		};
	},

	methods: {
		onPlay: function () {
			this.$emit( 'play' );
		}
	},

	mounted: function () {
		// Videojs is provided by the ext.tmh.video-js resource module
		// from the TimedMediaHandler Extension. See:
		// https://www.mediawiki.org/wiki/Extension:TimedMediaHandler
		// for more information. The ogvjs library is necessary to provide
		// support for OGG/WebM playback in browsers like Safari.
		mw.loader
			.using( 'ext.tmh.videojs-ogvjs' )
			.then( function () { return mw.OgvJsSupport.loadIfNeeded(); } )
			.then( function () {
				this.player = window.videojs(
					this.$refs.videoPlayer,
					$.extend( {}, this.options, {
						ogvjs: { base: mw.OgvJsSupport.basePath() }
					} ),
					function onPlayerReady() {}
				);

				this.player.on( 'play', this.onPlay );
			}.bind( this ) );
	},

	unmounted: function () {
		if ( this.player ) {
			this.player.dispose();
		}
	}
};
</script>
