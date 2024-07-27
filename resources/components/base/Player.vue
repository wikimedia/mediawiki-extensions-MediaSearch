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

	emits: [
		'play'
	],

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
			.then( () => mw.OgvJsSupport.loadIfNeeded() )
			.then( () => {
				this.player = window.videojs(
					this.$refs.videoPlayer,
					Object.assign( {}, this.options, {
						ogvjs: { base: mw.OgvJsSupport.basePath() }
					} ),
					() => {}
				);

				this.player.on( 'play', this.onPlay );
			} );
	},

	unmounted: function () {
		if ( this.player ) {
			this.player.dispose();
		}
	}
};
</script>
