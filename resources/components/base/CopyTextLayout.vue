<template>
	<div class="sd-copy-text-layout" :class="rootClasses">
		<span class="sd-copy-text-layout__text">
			{{ copyText }}
		</span>
		<sd-button
			class="sd-copy-text-layout__button"
			:progressive="true"
			:frameless="true"
			@click="handleCopyText"
		>
			{{ buttonText }}
		</sd-button>
	</div>
</template>

<script>
const SdButton = require( './Button.vue' );

/**
 * Text with a button that copies the text to the user's clipboard.
 */
// @vue/component
module.exports = exports = {
	name: 'SdCopyTextLayout',

	compatConfig: {
		ATTR_FALSE_VALUE: true
	},

	components: {
		'sd-button': SdButton
	},

	props: {
		/**
		 * The text to be copied.
		 */
		copyText: {
			type: String,
			required: true
		},

		buttonText: {
			type: [ String, Object ],
			default: function () {
				return mw.msg( 'mediasearch-copytextlayout-copy' );
			}
		},

		/**
		 * Set to true to make component inline instead of block.
		 */
		inline: {
			type: Boolean
		},

		/**
		 * Set to true to create a single-line that hides text overflow with an
		 * ellipsis. Otherwise, text will wrap onto subsequent lines normally.
		 */
		hideOverflow: {
			type: Boolean
		},

		successMessage: {
			type: [ String, Object ],
			default: function () {
				return mw.msg( 'mediasearch-copytextlayout-copy-success' );
			}
		},

		failMessage: {
			type: [ String, Object ],
			default: function () {
				return mw.msg( 'mediasearch-copytextlayout-copy-fail' );
			}
		}
	},

	computed: {
		rootClasses: function () {
			return {
				'sd-copy-text-layout--hide-overflow': this.hideOverflow,
				'sd-copy-text-layout--inline': this.inline && !this.hideOverflow
			};
		}
	},

	methods: {
		/**
		 * Try to copy text to the user's clipboard and inform them of results.
		 */
		handleCopyText: function () {
			var textarea = document.createElement( 'textarea' ),
				range = document.createRange(),
				selection,
				copied;

			// Set the value of the textarea to our copytext.
			textarea.textContent = this.copyText;

			// Earlier iOS versions need contenteditable to be true.
			textarea.contentEditable = true;

			// Make sure the textarea isn't editable.
			textarea.readOnly = true;

			// Make the textarea invisible and add to the DOM.
			textarea.style.position = 'absolute';
			textarea.style.left = '-9999px';
			document.body.appendChild( textarea );

			// Use a range and a selection to grab the contents of the textarea.
			// In most modern browsers we could just do textarea.select(), but
			// iOS versions below 14 don't implement this.
			range.selectNodeContents( textarea );
			selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange( range );
			// Set this to a huge number to make sure we're getting the entire
			// selection.
			textarea.setSelectionRange( 0, this.copyText.length );

			// Set contenteditable to false just to be safe.
			textarea.contentEditable = false;

			// Try to copy the text.
			try {
				copied = document.execCommand( 'copy' );
			} catch ( e ) {
				copied = false;
			}

			// Show a success or failure message.
			if ( copied ) {
				mw.notify( this.successMessage );
				this.$emit( 'copy' );
			} else {
				mw.notify( this.failMessage, { type: 'error' } );
			}

			// Remove the textarea element.
			document.body.removeChild( textarea );
		}
	}

};
</script>
