<template>
	<transition v-if="showNotice" name="sdms-fade-out">
		<cdx-message
			:dismiss-button-label="$i18n( 'mediasearch-user-notice-dismiss' ).text()"
			class="sdms-user-notice__message"
			@user-dismissed="dismiss"
		>
			<span
				v-i18n-html:mediasearch-user-notice-title
				class="sdms-user-notice__title"
			></span>
			<br>
			<span v-i18n-html:mediasearch-user-notice-body></span>
		</cdx-message>
	</transition>
</template>

<script>
const { CdxMessage } = require( '@wikimedia/codex' );

// @vue/component
module.exports = exports = {
	name: 'UserNotice',

	compatConfig: {
		MODE: 3
	},

	components: {
		CdxMessage
	},

	data: function () {
		return {
			prefKey: 'sdms-search-user-notice-dismissed',
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
