/**
 * @file observer.js
 *
 * Re-usable mixin to add IntersectionObserver functionality to a component. The mixins automatically bind the root element to the observer.
 * The mixins is flexible, as it allows the user to modify certain value to fulfil their needs.
 */
module.exports = {
	data: function () {
		return {
			/**
			 * HTML selector used to override the default element (default is the element root)
			 */
			observerElement: null,
			/**
			 * Object used to override the default IntersectObserver values.
			 */
			observerOptions: null,
			/**
			 * Boolean value indicating if the element is currenctly being intersected.
			 * This is used by the main component to trigger changes
			 */
			observerIntersecting: false
		};
	},

	methods: {
		/**
		 * Helper method used to manually disconnect the Observer
		 */
		disconnectObserver: function () {
			this.observer.disconnect();
		},
		/**
		 * Helper method define the element to be used in the observer
		 *
		 * @param {string} observerElement
		 * @return {HTMLElement}
		 */
		defineObserverElement: function ( observerElement ) {
			return this.$el.querySelector( observerElement ) || this.$el;
		},
		/**
		 * Callback triggered by the interceptorObserver when a change occur
		 *
		 * @param {Object} entries
		 */
		intersectionCallback: function ( entries ) {
			// An array of entries will be passed to the callback,
			// but we only care about the first element
			const entry = entries[ 0 ];

			if ( entry && entry.isIntersecting ) {
				this.$emit( 'intersect' );
				this.observerIntersecting = true;
			}

			if ( entry && !entry.isIntersecting ) {
				this.$emit( 'hide' );
				this.observerIntersecting = false;
			}

			this.$emit( 'change' );
		}
	},

	/**
	 * Create an intersection observer when the Observer component mounts
	 */
	mounted: function () {
		// eslint-disable-next-line compat/compat
		this.observer = new IntersectionObserver(
			this.intersectionCallback.bind( this ), // what to do when intersection occurs
			this.observerOptions || {} // additional options can be provided as props to this component
		);
		this.$nextTick(
			() => {
				const intersectElement = this.defineObserverElement( this.observerElement );
				this.observer.observe( intersectElement );
			}
		);
	},

	/**
	 * Disconnect the observer when the component is destroyed
	 */
	unmounted: function () {
		this.disconnectObserver();
	}
};
