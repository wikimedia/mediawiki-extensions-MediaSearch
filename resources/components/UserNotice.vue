<template>
	<transition v-if="showNotice" name="sdms-fade-out">
		<sd-message class="sdms-user-notice__message" type="notice">
			<p>
				<span
					v-i18n-html:mediasearch-user-notice-title
					class="sdms-user-notice__title"
				></span>
				<br>
				<span v-i18n-html:mediasearch-user-notice-body></span>
			</p>
			<sd-button
				class="sdms-user-notice__dismiss-button"
				:invisible-text="true"
				:frameless="true"
				:icon="closeIcon"
				@click="dismiss"
			>
				{{ $i18n( 'mediasearch-user-notice-dismiss' ).text() }}
			</sd-button>
		</sd-message>
	</transition>
</template>

<script>
const Button = require( './base/Button.vue' );
const closeIcon = require( '../../lib/icons.js' ).sdIconClose;
const Message = require( './base/Message.vue' );

// @vue/component
module.exports = exports = {
	name: 'UserNotice',

	components: {
		'sd-button': Button,
		'sd-message': Message
	},

	data: function () {
		return {
			prefKey: 'sdms-search-user-notice-dismissed',
			closeIcon: closeIcon,
			dismissed: false
		};
	},

	computed: {
		previouslyDismissed: function () {
			const numVal = Number( mw.user.options.get( this.prefKey ) );
			return Boolean( numVal );
		},

		isMobileSkin: function () {
			return mw.config.get( 'skin' ) === 'minerva';
		},

		showNotice: function () {
			if ( mw.user.isAnon() || this.isMobileSkin ) {
				return false;
			} else {
				return !this.previouslyDismissed && !this.dismissed;
			}
		}
	},

	methods: {
		dismiss: function () {
			new mw.Api().saveOption( this.prefKey, 1 );
			mw.user.options.set( this.prefKey, 1 );
			this.dismissed = true;
		}
	}
};
</script>
