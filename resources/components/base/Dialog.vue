<template>
	<div class="sd-dialog-wrapper">
		<transition name="sd-scale" appear>
			<div
				v-if="active"
				class="sd-dialog"
				:class="rootClasses"
				role="dialog"
				aria-fullscreen="true"
				@keyup="onKeyup"
			>
				<div class="sd-dialog__overlay" @click="close"></div>
				<div ref="landing" tabindex="0"></div>
				<div class="sd-dialog__shell">
					<div v-if="!headless" class="sd-dialog__header">
						<div v-if="title" class="sd-dialog__header-title">
							{{ title }}
						</div>

						<sd-button
							class="sd-dialog__header-action--safe"
							:invisible-text="true"
							:frameless="true"
							:icon="closeIcon"
							@click="close"
						></sd-button>

						<sd-button
							v-if="isMobileSkin && progressiveAction"
							class="sd-dialog__header-action--progressive"
							:primary="true"
							:progressive="true"
							:disabled="progressiveActionDisabled"
							@click="progress"
						>
							{{ progressiveAction }}
						</sd-button>
					</div>

					<div
						class="sd-dialog__body"
						:class="bodyClasses"
						tabindex="-1"
					>
						<div class="sd-dialog__body__content">
							<slot></slot>
						</div>
					</div>

					<div class="sd-dialog__footer">
						<sd-button
							v-if="!isMobileSkin && progressiveAction"
							class="sd-dialog__footer-action--progressive"
							:primary="true"
							:progressive="true"
							:disabled="progressiveActionDisabled"
							@click="progress"
						>
							{{ progressiveAction }}
						</sd-button>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
var SdButton = require( './Button.vue' ),
	closeIcon = require( '../../../lib/icons.js' ).sdIconClose;

/**
 * Dialog component.
 *
 * This component will append its element to the end of the <body> on mount.
 * When the active prop is true, the dialog will display, with CSS transitions
 * during open and close. See prop documentation for more details.
 *
 * Known shortcomings:
 * - We have not yet handled the use of components that have overlays inside
 *   this dialog, so you may find that things like select list menus get cut off
 *   due to CSS overflow rules.
 * - Whether the dialog is fullscreen is determined based on the skin (it will
 *   be fullscreen if the skin is Minerva Neue), you can't control this via a
 *   prop
 * - Dialog min-height should be set via CSS to something natural-looking. In
 *   the future, we should handle this within the dialog component to size the
 *   height according to the body content height and the viewport size.
 * - The dialog can display a progressive action, but handling a destructive
 *   action has not yet been implemented.
 */
// @vue/component
module.exports = {
	name: 'SdDialog',

	components: {
		'sd-button': SdButton
	},

	props: {
		/**
		 * Whether the dialog is visible.
		 */
		active: {
			type: Boolean
		},

		/**
		 * Title to appear in the dialog header.
		 */
		title: {
			// String or mw.msg object.
			type: [ String, Object ],
			default: null
		},

		/**
		 * Label for the progressive action.
		 */
		progressiveAction: {
			// String or mw.msg object.
			type: [ String, Object ],
			default: ''
		},

		/**
		 * Whether to disable the progresive action button
		 */
		progressiveActionDisabled: {
			type: Boolean
		},

		/**
		 * Set to true to remove the header (and, therefore, the built-in close
		 * button).
		 */
		headless: {
			type: Boolean
		}
	},

	data: function () {
		return {
			closeIcon: closeIcon,
			fullscreen: mw.config.get( 'skin' ) === 'minerva'
		};
	},

	computed: {
		/**
		 * @return {Object}
		 */
		rootClasses: function () {
			return {
				'sd-dialog--fullscreen': this.fullscreen
			};
		},

		/**
		 * @return {Object}
		 */
		bodyClasses: function () {
			return {
				'sd-dialog__body--headless': this.headless
			};
		},

		/**
		 * @return {boolean}
		 */
		isMobileSkin: function () {
			return mw.config.get( 'skin' ) === 'minerva';
		}
	},

	methods: {
		/**
		 * @fires close
		 */
		close: function () {
			this.$emit( 'close' );
		},

		/**
		 * @fires progress
		 */
		progress: function () {
			this.$emit( 'progress' );
		},

		/**
		 * @param {KeyboardEvent} e
		 * @fires close|key
		 */
		onKeyup: function ( e ) {
			if ( e.code === 'Escape' ) {
				this.$emit( 'close' );
			} else {
				this.$emit( 'key', e.code );
			}
		}
	},

	watch: {
		active: function ( newVal ) {
			if ( newVal === true ) {
				// Add a class to the body so we can hide overflow, preventing
				// confusing scrolling behavior.
				document.body.classList.add( 'sd-body--open-dialog' );

				// Move focus to the dialog element.
				this.$nextTick( function () {
					this.$refs.landing.focus();
				} );
			} else {
				document.body.classList.remove( 'sd-body--open-dialog' );
			}
		}
	},

	mounted: function () {
		// Add this component to the end of the body element.
		document.body.appendChild( this.$el );
	},

	beforeDestroy: function () {
		// Remove lingering body class and the element itself.
		document.body.classList.remove( 'sd-body--open-dialog' );
		document.body.removeChild( this.$el );
	}
};
</script>
