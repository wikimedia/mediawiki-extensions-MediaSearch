const { nextTick } = require( 'vue' );
const { mount, shallowMount } = require( '@vue/test-utils' );
const { CdxTextInput } = require( '@wikimedia/codex' );
const SdSelectMenu = require( '../../../../resources/components/base/SelectMenu.vue' );
const AutocompleteSearchInput = require( '../../../../resources/components/base/AutocompleteSearchInput.vue' );

describe( 'AutocompleteSearchInput Component', () => {
	it( 'renders successfully if name and label is passed', () => {
		const wrapper = mount( AutocompleteSearchInput, {
			props: {
				name: 'sdms-search-input',
				label: 'Search',
				initialized: true
			}
		} );

		const element = wrapper.find( '.sd-input' );
		expect( element.exists() ).toBe( true );
	} );

	describe( 'when the input receives input', () => {
		it( 'emits an input event', async () => {
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'sdms-search-input',
					label: 'Search',
					initialized: true
				}
			} );

			const component = wrapper.findComponent( CdxTextInput );
			await component.trigger( 'input' );
			await nextTick();
			expect( wrapper.emitted().input ).toHaveLength( 1 );
		} );
	} );

	describe( 'when the input receives blur', () => {
		it( 'emits a blur event and toggles lookup results when CdxInput is blurred', async () => {
			const lookupResults = [];
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'sdms-search-input',
					label: 'Search',
					lookupResults,
					initialized: true
				}
			} );

			const mockToggleLookupResults = jest.fn();
			wrapper.vm.toggleLookupResults = mockToggleLookupResults;
			const component = wrapper.findComponent( CdxTextInput );

			await component.trigger( 'blur' );
			await nextTick();

			expect( wrapper.emitted().blur ).toHaveLength( 1 );
			expect( mockToggleLookupResults ).toHaveBeenCalledWith( false );
		} );
	} );

	describe( 'when the input receives focus', () => {
		it( 'emits focus event and toggle lookup result', async () => {
			const lookupResults = [];
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'sdms-search-input',
					label: 'Search',
					lookupResults,
					initialized: true
				},
				attachTo: document.body
			} );

			const mockToggleLookupResults = jest.fn();
			wrapper.vm.toggleLookupResults = mockToggleLookupResults;
			const component = wrapper.findComponent( CdxTextInput );

			await component.trigger( 'focus' );
			await nextTick();

			expect( wrapper.emitted().focus ).toHaveLength( 1 );
			expect( mockToggleLookupResults ).toHaveBeenCalledWith( false );
		} );
	} );

	describe( 'when "submit" event is triggered from the input', () => {
		it( 'emits a submit event', async () => {
			const blurStub = jest.fn();

			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'sdms-search-input',
					label: 'Search',
					lookupResults: [],
					initialized: true,
					buttonLabel: 'Search'
				},
				global: {
					stubs: {
						CdxTextInput: {
							template: '<input>',
							methods: {
								blur: blurStub
							}
						}
					}
				}
			} );

			await wrapper.findComponent( CdxTextInput ).trigger( 'keydown.enter' );
			await nextTick();
			expect( wrapper.emitted( 'submit' ) ).toHaveLength( 1 );
		} );

		it( 'calls the "blur" method of the text input component', async () => {
			const blurStub = jest.fn();
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'sdms-search-input',
					label: 'Search',
					lookupResults: [],
					initialized: true,
					buttonLabel: 'Search'
				},
				global: {
					stubs: {
						CdxTextInput: {
							template: '<input>',
							methods: {
								blur: blurStub
							}
						}
					}
				}
			} );

			await wrapper.findComponent( CdxTextInput ).trigger( 'keydown.enter' );
			await nextTick();
			expect( blurStub ).toHaveBeenCalled();
		} );

		it( 'emits the "clear-lookup-results" event', async () => {
			const blurStub = jest.fn();
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'sdms-search-input',
					label: 'Search',
					lookupResults: [],
					initialized: true,
					buttonLabel: 'Search'
				},
				global: {
					stubs: {
						CdxTextInput: {
							template: '<input>',
							methods: {
								blur: blurStub
							}
						}
					}
				}
			} );

			await wrapper.findComponent( CdxTextInput ).trigger( 'keydown.enter' );
			await nextTick();
			expect( wrapper.emitted( 'clear-lookup-results' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'when the "down" arrow key is pressed', () => {
		it( 'if has lookup result and active item is not last item, set active item as next item', async () => {
			const lookupResults = [
				{ value: 'one' },
				{ value: 'two' }
			];
			const initialActiveLookupItemIndex = 0;
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'sdms-search-input',
					label: 'Search',
					lookupResults,
					initialized: true,
					buttonLabel: 'Search'
				}
			} );
			wrapper.setData( {
				activeLookupItemIndex: initialActiveLookupItemIndex
			} );

			const component = wrapper.findComponent( CdxTextInput );
			await component.trigger( 'keydown.down' );
			await nextTick();

			expect( wrapper.vm.activeLookupItemIndex ).toBe( initialActiveLookupItemIndex + 1 );
		} );

		it( 'if has lookup result and active item is last item, set active item as initial item', async () => {
			const lookupResults = [
				{ value: 'one' },
				{ value: 'two' }
			];
			const initialActiveLookupItemIndex = 1;
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'tab',
					label: 'actions',
					lookupResults,
					initialized: true
				}
			} );
			wrapper.setData( {
				activeLookupItemIndex: initialActiveLookupItemIndex
			} );

			const component = wrapper.findComponent( CdxTextInput );
			await component.trigger( 'keydown.down' );
			await nextTick();
			expect( wrapper.vm.activeLookupItemIndex ).toBe( 0 );
		} );
	} );

	describe( 'when the "up" arrow key is pressed', () => {
		it( 'if has lookup result and active item is first item, set active item as last item', async () => {
			const lookupResults = [
				{ value: 'one' },
				{ value: 'two' }
			];
			const initialActiveLookupItemIndex = 0;
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'tab',
					label: 'actions',
					lookupResults,
					initialized: true
				}
			} );
			wrapper.setData( {
				activeLookupItemIndex: initialActiveLookupItemIndex
			} );

			const component = wrapper.findComponent( CdxTextInput );
			await component.trigger( 'keydown.up' );
			await nextTick();

			expect( wrapper.vm.activeLookupItemIndex ).toBe( lookupResults.length - 1 );
		} );

		it( 'if has lookup result and active item is not first item, set active item as previous item', async () => {
			const lookupResults = [
				{ value: 'one' },
				{ value: 'two' }
			];
			const initialActiveLookupItemIndex = 1;
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'tab',
					label: 'actions',
					lookupResults,
					initialized: true
				}
			} );
			wrapper.setData( {
				activeLookupItemIndex: initialActiveLookupItemIndex
			} );

			const component = wrapper.findComponent( CdxTextInput );
			await component.trigger( 'keydown.up' );
			await nextTick();

			expect( wrapper.vm.activeLookupItemIndex ).toBe( initialActiveLookupItemIndex - 1 );
		} );
	} );

	describe( 'menu of lookup items', () => {
		it( 'renders if hasLookupResults & showLookupResults', async () => {
			const lookupResults = [
				{ value: 'active' }
			];
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'tab',
					label: 'actions',
					lookupResults,
					initialized: true
				}
			} );

			wrapper.setData( {
				showLookupResults: true
			} );

			await nextTick();
			const element = wrapper.findComponent( SdSelectMenu );
			expect( element.exists() ).toBe( true );
		} );

		it( 'on select, hasLookupResults & showLookupResults, emit submit event and clear lookup result', () => {
			const lookupResults = [ { value: 'active' } ];
			const mockClearLookupResults = jest.fn();
			const wrapper = mount( AutocompleteSearchInput, {
				props: {
					name: 'tab',
					label: 'actions',
					lookupResults,
					initialized: true
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
				{ value: 'active' },
				{ value: 'inactive' }
			];
			const testLookupItemIndex = 1;
			const wrapper = mount( AutocompleteSearchInput, {
				props: {
					name: 'tab',
					label: 'actions',
					lookupResults,
					initialized: true
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

	describe( 'When the clear icon is clicked', () => {
		it( 'emits a clear event', async () => {
			const lookupResults = [
				{ value: 'active' }
			];
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'tab',
					label: 'actions',
					initialValue: 'active',
					lookupResults,
					initialized: true
				},
				data: function () {
					return {
						showLookupResults: true
					};
				}
			} );

			const component = wrapper.findComponent( CdxTextInput );
			await component.trigger( 'clear' );
			await nextTick();

			expect( wrapper.emitted().clear ).toHaveLength( 1 );
		} );
	} );

	describe( 'Show or hide lookup results', () => {
		it( 'toggleLookupResults is called with true', async () => {
			const lookupResults = [
				{ value: 'active' }
			];
			const wrapper = shallowMount( AutocompleteSearchInput, {
				props: {
					name: 'tab',
					label: 'actions',
					lookupResults,
					initialized: true
				}
			} );

			wrapper.vm.toggleLookupResults( true );
			await nextTick();

			expect( wrapper.vm.showLookupResults ).toBeTruthy();
		} );
	} );
} );
