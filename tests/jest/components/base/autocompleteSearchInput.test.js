const Vue = require( 'vue' ),
	VueTestUtils = require( '@vue/test-utils' ),
	SdSelectMenu = require( '../../../../resources/components/base/SelectMenu.vue' ),
	AutocompleteSearchInput = require( '../../../../resources/components/base/AutocompleteSearchInput.vue' );

describe( 'AutocompleteSearchInput Component', () => {

	it( 'renders successfully if name and label is passed', () => {

		const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
			propsData: {
				name: 'tab',
				label: 'actions'
			}
		} );

		const element = wrapper.find( '.sd-input' );

		expect( element.exists() ).toBe( true );

	} );

	describe( 'onInput', () => {

		it( 'emit input event', () => {

			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions'
				}
			} );

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'input' );

			expect( wrapper.emitted().input ).toHaveLength( 1 );

		} );

	} );

	describe( 'onBlur', () => {

		it( 'emit blur event', () => {

			const lookupResults = [];
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				}
			} );

			const mockToggleLookupResults = jest.fn();
			wrapper.vm.toggleLookupResults = mockToggleLookupResults;

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'blur' );

			expect( wrapper.emitted().blur ).toHaveLength( 1 );
			expect( mockToggleLookupResults ).toHaveBeenCalledWith( false );

		} );

	} );

	describe( 'onFocus', () => {

		it( 'emit focus event and toggle lookup result', () => {

			const lookupResults = [];
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				},
				attachTo: document.body
			} );

			const mockToggleLookupResults = jest.fn();
			wrapper.vm.toggleLookupResults = mockToggleLookupResults;

			const element = wrapper.find( '.sd-input__input' );
			element.element.focus();

			expect( wrapper.emitted().focus ).toHaveLength( 1 );
			expect( mockToggleLookupResults ).toHaveBeenCalledWith( false );

		} );

	} );

	describe( 'onSubmit', () => {

		it( 'if has lookup result and activeLookupItemIndex > 0, update value', () => {
			const lookupResults = [
				{
					value: 'active'
				}
			];
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				}
			} );
			wrapper.setData( {
				activeLookupItemIndex: 0,
				showLookupResults: true
			} );

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'keyup.enter' );

			expect( wrapper.vm.value ).toBe( lookupResults[ wrapper.vm.activeLookupItemIndex ] );

		} );

		it( 'emit submit event', () => {

			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults: []
				}
			} );

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'keyup.enter' );

			expect( wrapper.emitted().submit ).toHaveLength( 1 );

		} );

		it( 'clear lookup results', () => {

			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults: []
				}
			} );

			const mockClearLookupResults = jest.fn();
			wrapper.vm.clearLookupResults = mockClearLookupResults;

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'keyup.enter' );

			expect( mockClearLookupResults ).toHaveBeenCalled();

		} );

		it( 'Remove keyboard focus from input', () => {

			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults: []
				}
			} );

			const mockInputBlur = jest.fn();
			wrapper.vm.$refs.input.blur = mockInputBlur;

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'keyup.enter' );

			expect( mockInputBlur ).toHaveBeenCalled();

		} );

	} );

	describe( 'onArrowDown', () => {

		it( 'if has lookup result and active item is not last item, set active item as next item', () => {
			const lookupResults = [
				{
					value: 'active'
				},
				{
					value: 'inactive'
				}
			];
			const initialActiveLookupItemIndex = 0;
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				}
			} );
			wrapper.setData( {
				activeLookupItemIndex: initialActiveLookupItemIndex
			} );

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'keyup.down' );

			expect( wrapper.vm.activeLookupItemIndex ).toBe( initialActiveLookupItemIndex + 1 );

		} );

		it( 'if has lookup result and active item is last item, set active item as initial item', () => {

			const lookupResults = [
				{
					value: 'active'
				},
				{
					value: 'inactive'
				}
			];
			const initialActiveLookupItemIndex = 1;
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				}
			} );
			wrapper.setData( {
				activeLookupItemIndex: initialActiveLookupItemIndex
			} );

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'keyup.down' );

			expect( wrapper.vm.activeLookupItemIndex ).toBe( 0 );

		} );

	} );

	describe( 'onArrowUp', () => {

		it( 'if has lookup result and active item is first item, set active item as last item', () => {
			const lookupResults = [
				{
					value: 'active'
				},
				{
					value: 'inactive'
				}
			];
			const initialActiveLookupItemIndex = 0;
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				}
			} );
			wrapper.setData( {
				activeLookupItemIndex: initialActiveLookupItemIndex
			} );

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'keyup.up' );

			expect( wrapper.vm.activeLookupItemIndex ).toBe( lookupResults.length - 1 );

		} );

		it( 'if has lookup result and active item is not first item, set active item as previous item', () => {

			const lookupResults = [
				{
					value: 'active'
				},
				{
					value: 'inactive'
				}
			];
			const initialActiveLookupItemIndex = 1;
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				}
			} );
			wrapper.setData( {
				activeLookupItemIndex: initialActiveLookupItemIndex
			} );

			const element = wrapper.find( '.sd-input__input' );
			element.trigger( 'keyup.up' );

			expect( wrapper.vm.activeLookupItemIndex ).toBe( initialActiveLookupItemIndex - 1 );

		} );

	} );

	describe( 'selectMenu', () => {

		it( 'renders if hasLookupResults & showLookupResults', ( done ) => {

			const lookupResults = [
				{
					value: 'active'
				}
			];
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				}
			} );

			wrapper.setData( {
				showLookupResults: true
			} );

			Vue.nextTick().then( () => {

				const element = wrapper.findComponent( SdSelectMenu );

				expect( element.exists() ).toBe( true );

				done();
			} );

		} );

		it( 'on select, hasLookupResults & showLookupResults, emit submit event and clear lookup result', () => {

			const lookupResults = [
				{
					value: 'active'
				}
			];
			const mockClearLookupResults = jest.fn();
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				},
				data: function () {
					return {
						showLookupResults: true
					};
				}
			} );

			wrapper.vm.clearLookupResults = mockClearLookupResults;

			const element = wrapper.findComponent( SdSelectMenu );
			element.vm.$emit( 'select', 0 );

			expect( wrapper.emitted().submit ).toHaveLength( 1 );

			expect( mockClearLookupResults ).toHaveBeenCalled();

		} );

		it( '"on active-item-change", activeLookupItemIndex is changed to given value', () => {

			const lookupResults = [
				{
					value: 'active'
				},
				{
					value: 'active'
				}
			];
			const testLookupItemIndex = 1;
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				},
				data: function () {
					return {
						showLookupResults: true
					};
				}
			} );

			const element = wrapper.findComponent( SdSelectMenu );
			element.vm.$emit( 'active-item-change', testLookupItemIndex );

			expect( wrapper.vm.activeLookupItemIndex ).toBe( testLookupItemIndex );

		} );

	} );

	describe( 'onIconClick', () => {

		it( 'call nextTick', () => {

			const lookupResults = [
				{
					value: 'active'
				}
			];
			const mockClearLookupResults = jest.fn();
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				},
				data: function () {
					return {
						showLookupResults: true
					};
				}
			} );

			wrapper.vm.$nextTick = mockClearLookupResults;

			const element = wrapper.find( '.sd-input__icon' );
			element.trigger( 'click' );

			expect( mockClearLookupResults ).toHaveBeenCalled();

		} );

	} );

	describe( 'clear Icon', () => {

		it( 'onClick emit clear event', () => {

			const lookupResults = [
				{
					value: 'active'
				}
			];
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					initialValue: 'active',
					lookupResults
				},
				data: function () {
					return {
						showLookupResults: true
					};
				}
			} );

			const element = wrapper.find( '.sd-input__indicator' );
			element.trigger( 'click' );

			expect( wrapper.emitted().clear ).toHaveLength( 1 );

		} );

	} );

	describe( 'Show or hide lookup results', () => {

		it( 'toggleLookupResults is called with true', () => {

			const lookupResults = [
				{
					value: 'active'
				}
			];
			const wrapper = VueTestUtils.mount( AutocompleteSearchInput, {
				propsData: {
					name: 'tab',
					label: 'actions',
					lookupResults
				}
			} );

			wrapper.vm.toggleLookupResults( true );

			expect( wrapper.vm.showLookupResults ).toBeTruthy();

		} );

	} );

} );
