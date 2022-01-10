const VueTestUtils = require( '@vue/test-utils' ),
	i18n = require( '../plugins/i18n.js' ),
	Component = require( '../../../resources/components/NamespaceFilterDialog.vue' ),
	Radio = require( '../../../resources/components/base/Radio.vue' ),
	Checkbox = require( '../../../resources/components/base/Checkbox.vue' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );

describe( 'EndOfResults', () => {
	it( 'render the component', () => {
		const wrapper = VueTestUtils.shallowMount( Component, {
			localVue: localVue,
			propsData: {
				items: [],
				namespaces: {},
				namespaceGroups: {},
				initialValue: 'all'
			}
		} );

		const element = wrapper.find( '.sdms-namespace-dialog' );
		expect( element.exists() ).toBe( true );
	} );

	describe( 'when items are set', () => {
		it( 'render an sd-radio', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [ { value: 'test' } ],
					namespaces: {},
					namespaceGroups: {},
					initialValue: 'all'
				}
			} );

			expect( wrapper.findComponent( Radio ).exists() ).toBe( true );
		} );
	} );

	describe( 'when formattedNamespaces are set', () => {
		it( 'render an sd-checkbox', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: { value: 'test' },
					namespaceGroups: {},
					initialValue: 'all'
				}
			} );

			expect( wrapper.findComponent( Checkbox ).exists() ).toBe( true );
		} );
	} );

	describe( 'initialRadio', () => {
		it( 'returns initial value if valid', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {},
					namespaceGroups: { test: { value: 'test' } },
					initialValue: 'test'
				}
			} );

			expect( wrapper.vm.initialRadio ).toBe( 'test' );
		} );
		it( 'returns custom if no initial value is provided', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {},
					namespaceGroups: { test: { value: 'test' } },
					initialValue: ''
				}
			} );

			expect( wrapper.vm.initialRadio ).toBe( 'custom' );
		} );
	} );

	describe( 'initialCustom', () => {
		it( 'returns 0 if initialValue is a valid namespaceGroup', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {},
					namespaceGroups: { test: { value: 'test' } },
					initialValue: 'test'
				}
			} );

			expect( wrapper.vm.initialCustom ).toContain( '0' );
		} );
		it( 'returns initialValue if is a custom value (number)', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {},
					namespaceGroups: { test: { value: 'test' } },
					initialValue: '10'
				}
			} );

			expect( wrapper.vm.initialCustom ).toContain( '10' );
		} );
		it( 'returns array with formatted InitialValue', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {},
					namespaceGroups: { test: { value: 'test' } },
					initialValue: '10|20|500'
				}
			} );

			expect( wrapper.vm.initialCustom.length ).toBe( 3 );
			expect( wrapper.vm.initialCustom ).toContain( '10' );
			expect( wrapper.vm.initialCustom ).toContain( '20' );
			expect( wrapper.vm.initialCustom ).toContain( '500' );
		} );
	} );
	describe( 'formattedNamespaces', () => {
		it( 'generates label and value for namespaces', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {
						10: 'test10'
					},
					namespaceGroups: {},
					initialValue: ''
				}
			} );

			expect( wrapper.vm.formattedNamespaces.length ).toBe( 1 );
			expect( wrapper.vm.formattedNamespaces[ 0 ] ).toMatchObject(
				expect.objectContaining( { label: 'test10', value: '10' } )
			);
		} );
		it( 'default the label for a namespace with a value of 0 (blanknamespace)', () => {
			global.mw.msg.mockReturnValueOnce( 'blanknamespace' );
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {
						0: 0
					},
					namespaceGroups: {},
					initialValue: ''
				}
			} );

			expect( wrapper.vm.formattedNamespaces.length ).toBe( 1 );
			expect( wrapper.vm.formattedNamespaces[ 0 ] ).toMatchObject(
				expect.objectContaining( { label: 'blanknamespace', value: '0' } )
			);
		} );
	} );

	describe( 'isCustom', () => {
		it( 'return true if selectedRadio is equal to "custom" ', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {},
					namespaceGroups: {},
					initialValue: 'custom'
				}
			} );
			wrapper.setData( { selectedRadio: 'custom', selectedCustom: [] } );
			expect( wrapper.vm.isCustom ).toBe( true );
		} );
	} );

	describe( 'disableDialogAction', () => {
		it( 'return false if not custom" ', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {},
					namespaceGroups: {},
					initialValue: 'custom'
				}
			} );
			wrapper.setData( { selectedRadio: 'notCustom', selectedCustom: [] } );
			expect( wrapper.vm.disableDialogAction ).toBe( false );
		} );
		it( 'return false if custom and with selected values" ', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {},
					namespaceGroups: {},
					initialValue: 'custom'
				}
			} );
			wrapper.setData( { selectedRadio: 'custom', selectedCustom: [ 1 ] } );
			expect( wrapper.vm.disableDialogAction ).toBe( false );
		} );
		it( 'return true if custom but without selected custom" ', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				localVue: localVue,
				propsData: {
					items: [],
					namespaces: {},
					namespaceGroups: {},
					initialValue: 'custom'
				}
			} );
			wrapper.setData( { selectedRadio: 'custom', selectedCustom: [] } );
			expect( wrapper.vm.disableDialogAction ).toBe( true );
		} );
	} );

	describe( 'methods', () => {
		describe( 'cancel', () => {
			it( 'emit a "close" event', () => {
				const wrapper = VueTestUtils.shallowMount( Component, {
					localVue: localVue,
					propsData: {
						items: [],
						namespaces: {},
						namespaceGroups: {},
						initialValue: 'test'
					}
				} );

				wrapper.vm.cancel();

				expect( wrapper.emitted().close ).toBeTruthy();
			} );
			it( 'reset selectedRadio to initialRadio', () => {
				const wrapper = VueTestUtils.shallowMount( Component, {
					localVue: localVue,
					propsData: {
						items: [],
						namespaces: {},
						namespaceGroups: {},
						initialValue: 'test'
					}
				} );
				const initialRadio = wrapper.vm.initialRadio;
				wrapper.vm.cancel();

				expect( wrapper.vm.selectedRadio ).toBe( initialRadio );
			} );
			it( 'reset selectedRadio to initialRadio', () => {
				const wrapper = VueTestUtils.shallowMount( Component, {
					localVue: localVue,
					propsData: {
						items: [],
						namespaces: {},
						namespaceGroups: {},
						initialValue: 'test'
					}
				} );
				const initialCustom = wrapper.vm.initialCustom;
				wrapper.vm.cancel();

				expect( wrapper.vm.selectedCustom ).toBe( initialCustom );
			} );
		} );
		describe( 'onProgress', () => {
			it( 'emit a "close" event', () => {
				const wrapper = VueTestUtils.shallowMount( Component, {
					localVue: localVue,
					propsData: {
						items: [],
						namespaces: {},
						namespaceGroups: {},
						initialValue: 'test'
					}
				} );

				wrapper.vm.onProgress();

				expect( wrapper.emitted().close ).toBeTruthy();
			} );
			it( 'emit a "submit" event', () => {
				const wrapper = VueTestUtils.shallowMount( Component, {
					localVue: localVue,
					propsData: {
						items: [],
						namespaces: {},
						namespaceGroups: {},
						initialValue: 'test'
					}
				} );

				wrapper.vm.onProgress();

				expect( wrapper.emitted().submit ).toBeTruthy();
			} );
			it( 'emit a "submit" event with selectedRadio if namespace is not custom', () => {
				const wrapper = VueTestUtils.shallowMount( Component, {
					localVue: localVue,
					propsData: {
						items: [],
						namespaces: {},
						namespaceGroups: {},
						initialValue: 'test'
					}
				} );

				wrapper.setData( { selectedRadio: 'notCustom' } );
				wrapper.vm.onProgress();

				expect( wrapper.emitted().submit[ 0 ] ).toEqual( [ 'notCustom' ] );
			} );
			it( 'emit a "submit" event with selectedCustom if namespace is custom', () => {
				const wrapper = VueTestUtils.shallowMount( Component, {
					localVue: localVue,
					propsData: {
						items: [],
						namespaces: {},
						namespaceGroups: {},
						initialValue: 'test'
					}
				} );

				wrapper.setData( { selectedRadio: 'custom', selectedCustom: [ 'test' ] } );
				wrapper.vm.onProgress();

				expect( wrapper.emitted().submit[ 0 ] ).toEqual( [ 'test' ] );
			} );
		} );
		describe( 'select', () => {
			describe( 'when value provided is part of namespaceGroups', () => {
				it( 'set seletedRadio as the value provided', () => {
					const wrapper = VueTestUtils.shallowMount( Component, {
						localVue: localVue,
						propsData: {
							items: [],
							namespaces: {},
							namespaceGroups: { test: { test: 'test' } },
							initialValue: 'test'
						}
					} );

					wrapper.vm.select( 'test' );

					expect( wrapper.vm.selectedRadio ).toEqual( 'test' );
				} );
				it( 'set reset selectedCustom to initialCustom', () => {
					const wrapper = VueTestUtils.shallowMount( Component, {
						localVue: localVue,
						propsData: {
							items: [],
							namespaces: {},
							namespaceGroups: { test: { test: 'test' } },
							initialValue: 'test'
						}
					} );

					wrapper.vm.select( 'test' );

					expect( wrapper.vm.selectedCustom ).toEqual( wrapper.vm.initialCustom );
				} );
			} );
			describe( 'when value provided is not part of namespaceGroups', () => {
				it( 'set seletedRadio as "custom"', () => {
					const wrapper = VueTestUtils.shallowMount( Component, {
						localVue: localVue,
						propsData: {
							items: [],
							namespaces: {},
							namespaceGroups: {},
							initialValue: 'test'
						}
					} );

					wrapper.vm.select( 'customValue' );

					expect( wrapper.vm.selectedRadio ).toEqual( 'custom' );
				} );
				it( 'set reset selectedCustom to the formatted value provided', () => {
					const wrapper = VueTestUtils.shallowMount( Component, {
						localVue: localVue,
						propsData: {
							items: [],
							namespaces: {},
							namespaceGroups: {},
							initialValue: 'test'
						}
					} );

					wrapper.vm.select( 'value|value2' );

					expect( wrapper.vm.selectedCustom.length ).toBe( 2 );
					expect( wrapper.vm.selectedCustom ).toContain( 'value' );
					expect( wrapper.vm.selectedCustom ).toContain( 'value2' );
				} );
			} );
		} );

		describe( 'reset', () => {
			it( 'reset the value of selectedRadio to initialRadio', () => {
				const wrapper = VueTestUtils.shallowMount( Component, {
					localVue: localVue,
					propsData: {
						items: [],
						namespaces: {},
						namespaceGroups: {},
						initialValue: 'test'
					}
				} );

				wrapper.vm.reset();

				expect( wrapper.vm.selectedRadio ).toBe( wrapper.vm.initialRadio );
			} );
			it( 'reset the value of selectedCustom to initialCustom', () => {
				const wrapper = VueTestUtils.shallowMount( Component, {
					localVue: localVue,
					propsData: {
						items: [],
						namespaces: {},
						namespaceGroups: {},
						initialValue: 'test'
					}
				} );

				wrapper.vm.reset();

				expect( wrapper.vm.selectedCustom ).toBe( wrapper.vm.initialCustom );
			} );
		} );
	} );
} );
