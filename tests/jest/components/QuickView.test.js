const { config, mount, shallowMount } = require( '@vue/test-utils' );
const Vue = require( 'vue' );

const SdPlayer = require( '../../../resources/components/base/Player.vue' );
const when = require( 'jest-when' ).when;
// grab a random image result from the set
// Note: results are stored as key/value pairs based on title, not a straight array
const originalImageSampleResult = require( '../fixtures/mockImageQuickSearchApiResponse.json' ).query.pages[ 9809267 ];
const originalVideoSampleResult = require( '../fixtures/mockVideoQuickSearchApiResponse.json' ).query.pages[ 96292422 ];

const icons = require( '@wikimedia/codex-icons' );

when( global.mw.config.get )
	.calledWith( 'sdmsAssessmentQuickviewLabels' )
	.mockReturnValue( {
		'assessment-1': 'test-1',
		'assessment-2': 'test-2'
	} );

// the above mocking need to be implemented before the component is required
const QuickView = require( '../../../resources/components/QuickView.vue' );

config.global.mocks.$log = jest.fn();

describe( 'QuickView', () => {
	let imageSampleResult, videoSampleResult;
	beforeEach( () => {
		when( global.mw.config.get )
			.calledWith( 'wgUserLanguage' )
			.mockReturnValue( 'en' );

		imageSampleResult = JSON.parse( JSON.stringify( originalImageSampleResult ) );
		videoSampleResult = JSON.parse( JSON.stringify( originalVideoSampleResult ) );
	} );

	describe( 'when image data is provided', () => {
		it( 'Renders successfully', () => {
			const wrapper = mount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			expect( wrapper.html().length ).toBeGreaterThan( 0 );
		} );

		it( 'displays a header image', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( 'header img' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays close, next, and previous buttons', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const close = wrapper.find( { ref: 'close' } );
			const next = wrapper.find( { ref: 'next' } );
			const prev = wrapper.find( { ref: 'previous' } );

			expect( close.exists() ).toBe( true );
			expect( next.exists() ).toBe( true );
			expect( prev.exists() ).toBe( true );
		} );

		it( 'emits a "close" event when the close button is clicked', ( done ) => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const close = wrapper.find( { ref: 'close' } );
			close.trigger( 'click' );

			Vue.nextTick().then( () => {
				expect( wrapper.emitted().close ).toHaveLength( 1 );
				done();
			} );
		} );

		it( 'emits a "next" event when the next button is clicked', ( done ) => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const next = wrapper.find( { ref: 'next' } );
			next.trigger( 'click' );

			Vue.nextTick().then( () => {
				expect( wrapper.emitted().next ).toHaveLength( 1 );
				done();
			} );
		} );

		it( 'emits a "previous" event when the previous button is clicked', ( done ) => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const prev = wrapper.find( { ref: 'previous' } );
			prev.trigger( 'click' );

			Vue.nextTick().then( () => {
				expect( wrapper.emitted().previous ).toHaveLength( 1 );
				done();
			} );
		} );

		it( 'applies the appropriate class to the base element', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view--image' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays an image title', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__title' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays an image description', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__description' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays the image artist', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__artist' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays the image license information', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__license' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays the image assessment', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				},
				computed: {
					assessmentList: jest.fn().mockReturnValue( [ 'assessment' ] )
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__assessment' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays a copy text section', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__copy-full-name' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays the image name without extension', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__copy-name-no-extension' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays the image creation date', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__creation-date' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays the image resolution', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__resolution' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays the image mine-type', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( '.sdms-quick-view__mine-type' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'contains a "more details" call-to-action button', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const moreDetails = wrapper.find( 'a.sdms-quick-view__cta' );
			expect( moreDetails.exists() ).toBe( true );
			expect( moreDetails.attributes().href ).toBe( imageSampleResult.canonicalurl );
		} );

	} );

	describe( 'when video data is provided', () => {
		it( 'Renders and sd-player component', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: videoSampleResult.title,
					canonicalurl: videoSampleResult.canonicalurl,
					videoinfo: videoSampleResult.videoinfo,
					mediaType: 'video',
					isDialog: false
				}
			} );

			expect( wrapper.findComponent( SdPlayer ).exists() ).toBe( true );
		} );

		it( 'applies the appropriate class to the base element', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'video',
					isDialog: false
				}
			} );

			expect( wrapper.find( '.sdms-quick-view--video' ).exists() ).toBeTruthy();
		} );

		it( 'applies the appropriate class for dialog', () => {
			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'video',
					isDialog: true
				}
			} );

			expect( wrapper.find( '.sdms-quick-view--dialog' ).exists() ).toBeTruthy();
		} );
	} );

	describe( 'Computed', () => {
		describe( 'imageClasses', () => {
			it( 'Returns the correct class when image is Extra small', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					}
				} );

				wrapper.setData( { isExtraSmall: true } );

				expect( wrapper.vm.imageClasses ).toMatchObject(
					expect.objectContaining( {
						'sdms-quick-view__thumbnail--xsmall': true
					} )
				);
			} );

			it( 'Returns the correct class when image is not thumbnail Wrapper Style', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					}
				} );

				wrapper.setData( { thumbnailWrapperStyle: false } );

				expect( wrapper.vm.imageClasses ).toMatchObject(
					expect.objectContaining( {
						'sdms-quick-view__thumbnail--loaded': true
					} )
				);
			} );
		} );

		describe( 'srcset', () => {
			beforeEach( () => {
				global.mw.util.parseImageUrl = jest.fn().mockReturnValue( {
					resizeUrl: jest.fn()
				} );
			} );

			it( 'Returns false if resizeUrl is not a function', () => {
				global.mw.util.parseImageUrl = jest.fn().mockReturnValue( {
					resizeUrl: null
				} );

				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					}
				} );

				expect( wrapper.vm.srcset ).toBeFalsy();
			} );

			it( 'include the just first PREVIEW_SIZE in string return', () => {
				const PREVIEW_SIZES = [ '640', '800', '1200', '1600' ];
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					}
				} );

				expect( wrapper.vm.srcset ).toContain( PREVIEW_SIZES[ 0 ] );
				expect( wrapper.vm.srcset ).not.toContain( PREVIEW_SIZES[ 1 ] );
				expect( wrapper.vm.srcset ).not.toContain( PREVIEW_SIZES[ 2 ] );
				expect( wrapper.vm.srcset ).not.toContain( PREVIEW_SIZES[ 3 ] );
			} );

			describe( 'When it is a dialog', () => {

				it( 'include each PREVIEW_SIZE in string return', () => {
					const PREVIEW_SIZES = [ '640', '800', '1200', '1600' ];
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( wrapper.vm.srcset ).toContain( PREVIEW_SIZES[ 0 ] );
					expect( wrapper.vm.srcset ).toContain( PREVIEW_SIZES[ 1 ] );
					expect( wrapper.vm.srcset ).toContain( PREVIEW_SIZES[ 2 ] );
					expect( wrapper.vm.srcset ).toContain( PREVIEW_SIZES[ 3 ] );
				} );

				it( 'include each MAX_SIZE in string return', () => {
					const MAX_SIZE = '2000';
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( wrapper.vm.srcset ).toContain( MAX_SIZE );
				} );
			} );
		} );
		describe( 'sizes', () => {
			beforeEach( () => {
				global.mw.util.parseImageUrl = jest.fn().mockReturnValue( {
					resizeUrl: jest.fn()
				} );
			} );

			it( 'include the just first PREVIEW_SIZE in string return', () => {
				const PREVIEW_SIZES = [ '640', '800', '1200', '1600' ];
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					}
				} );

				expect( wrapper.vm.sizes ).toContain( PREVIEW_SIZES[ 0 ] );
				expect( wrapper.vm.sizes ).not.toContain( PREVIEW_SIZES[ 1 ] );
				expect( wrapper.vm.sizes ).not.toContain( PREVIEW_SIZES[ 2 ] );
				expect( wrapper.vm.sizes ).not.toContain( PREVIEW_SIZES[ 3 ] );
			} );

			describe( 'When it is a dialog', () => {

				it( 'include each PREVIEW_SIZE in string return', () => {
					const PREVIEW_SIZES = [ '640', '800', '1200', '1600' ];
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( wrapper.vm.sizes ).toContain( PREVIEW_SIZES[ 0 ] );
					expect( wrapper.vm.sizes ).toContain( PREVIEW_SIZES[ 1 ] );
					expect( wrapper.vm.sizes ).toContain( PREVIEW_SIZES[ 2 ] );
					expect( wrapper.vm.sizes ).toContain( PREVIEW_SIZES[ 3 ] );
				} );

				it( 'include each MAX_SIZE in string return', () => {
					const MAX_SIZE = '2000';
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( wrapper.vm.sizes ).toContain( MAX_SIZE );
				} );
			} );
		} );
		describe( 'metadata', () => {
			describe( 'when it is of type image', () => {
				it( 'Returns the sample extmetadata', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( wrapper.vm.metadata ).toEqual( imageSampleResult.imageinfo[ 0 ].extmetadata );
				} );
			} );

			describe( 'when it is of type audio', () => {
				it( 'Returns the sample extmetadata', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: videoSampleResult.title,
							canonicalurl: videoSampleResult.canonicalurl,
							videoinfo: videoSampleResult.videoinfo,
							mediaType: 'audio',
							isDialog: true
						}
					} );

					expect( wrapper.vm.metadata ).toEqual( videoSampleResult.videoinfo[ 0 ].extmetadata );
				} );
			} );

			describe( 'when it is of type video', () => {
				it( 'Returns the sample extmetadata', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: videoSampleResult.title,
							canonicalurl: videoSampleResult.canonicalurl,
							videoinfo: videoSampleResult.videoinfo,
							mediaType: 'video',
							isDialog: true
						}
					} );

					expect( wrapper.vm.metadata ).toEqual( videoSampleResult.videoinfo[ 0 ].extmetadata );
				} );
			} );
		} );

		describe( 'licenseText', () => {
			describe( 'when metadata is not set', () => {
				it( 'Returns null', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( wrapper.vm.licenseText ).toBeFalsy();
				} );
			} );

			describe( 'when metadata includes UsageTerms', () => {
				it( 'Returns UsageTerms value', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );
					const sampleUsageTerms = imageSampleResult.imageinfo[ 0 ].extmetadata.UsageTerms.value;
					expect( wrapper.vm.licenseText ).toBe( sampleUsageTerms );
				} );
			} );

			describe( 'when metadata includes LicenseShortName', () => {
				it( 'Returns LicenseShortName value', () => {
					const sampleLicenseShortName = 'dummyLicense';
					imageSampleResult.imageinfo[ 0 ].extmetadata.UsageTerms = null;
					imageSampleResult.imageinfo[ 0 ].extmetadata.LicenseShortName = {
						value: sampleLicenseShortName
					};

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );
					expect( wrapper.vm.licenseText ).toBe( sampleLicenseShortName );
				} );
			} );
		} );

		describe( 'licenseIcon', () => {
			describe( 'when metadata is not set', () => {
				it( 'Returns null', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( wrapper.vm.licenseIcon ).toBeFalsy();
				} );
			} );

			describe( 'when metadata includes License', () => {
				it( 'Returns UsageTerms value', () => {
					const getLicenseIconSpy = jest.spyOn( QuickView.methods, 'getLicenseIcon' );
					shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );
					const sampleLicense = imageSampleResult.imageinfo[ 0 ].extmetadata.License.value;

					expect( getLicenseIconSpy ).toHaveBeenCalled();
					expect( getLicenseIconSpy ).toHaveBeenCalledWith( sampleLicense );
				} );
			} );

			describe( 'when metadata includes LicenseShortName', () => {
				it( 'Returns LicenseShortName value', () => {
					const getLicenseIconSpy = jest.spyOn( QuickView.methods, 'getLicenseIcon' );
					const sampleLicenseShortName = 'dummyLicense';
					imageSampleResult.imageinfo[ 0 ].extmetadata.License = null;
					imageSampleResult.imageinfo[ 0 ].extmetadata.LicenseShortName = {
						value: sampleLicenseShortName
					};

					shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( getLicenseIconSpy ).toHaveBeenCalled();
					expect( getLicenseIconSpy ).toHaveBeenCalledWith( sampleLicenseShortName );
				} );
			} );
		} );

		describe( 'LicenseUrl', () => {
			describe( 'when metadata is not set', () => {
				it( 'Returns null', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( wrapper.vm.LicenseUrl ).toBeFalsy();
				} );
			} );

			describe( 'when metadata is set', () => {
				it( 'Returns LicenseUrl value', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );

					const LicenseUrl = imageSampleResult.imageinfo[ 0 ].extmetadata.LicenseUrl.value;
					expect( wrapper.vm.licenseUrl ).toBe( LicenseUrl );
				} );
			} );
		} );

		describe( 'assessmentList', () => {
			describe( 'when assessment is not set', () => {
				it( 'return false', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							mediaType: 'image',
							isDialog: true
						}
					} );

					expect( wrapper.vm.assessmentList ).toBeFalsy();

				} );
			} );
			describe( 'when assessment is set', () => {
				it( 'return false', () => {
					imageSampleResult.imageinfo[ 0 ].extmetadata.Assessments = {
						value: 'assessment-1|assessment-2'
					};

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: true
						}
					} );

					// this are the value of sdmsAssessmentQuickviewLabels declared at the top of the file
					expect( wrapper.vm.assessmentList ).toContain( 'test-1' );
					expect( wrapper.vm.assessmentList ).toContain( 'test-2' );

				} );
			} );
		} );

		describe( 'creationDate', () => {
			describe( 'when DateTimeOriginal is an instance of Date', () => {
				it( 'Returns the original Date string', () => {

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );

					expect( wrapper.vm.creationDate ).toBe( '18 January 2009' );
				} );
			} );
			describe( 'when DateTimeOriginal is not an instance of Date', () => {
				it( 'Returns the original Date string', () => {

					const fakeDate = 'this is an arbitrary string and not a date';
					imageSampleResult.imageinfo[ 0 ].extmetadata.DateTimeOriginal = {
						value: fakeDate
					};

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );

					expect( wrapper.vm.creationDate ).toBe( fakeDate );
				} );
			} );
		} );
		describe( 'resolution', () => {
			describe( 'When width is missing', () => {
				it( 'Returns null', () => {
					imageSampleResult.imageinfo[ 0 ].width = null;

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );

					expect( wrapper.vm.resolution ).toBeFalsy();
				} );
			} );
			describe( 'When height is missing', () => {
				it( 'Returns null', () => {
					imageSampleResult.imageinfo[ 0 ].height = null;

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );

					expect( wrapper.vm.resolution ).toBeFalsy();
				} );
			} );
			describe( 'When values are available', () => {
				it( 'Returns a formatted value', () => {

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );

					expect( wrapper.vm.resolution ).toBe( '2,484 × 1,870' );
				} );
			} );
		} );
		describe( 'mimeType', () => {
			it( 'Returns mime property of provided info', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					}
				} );

				expect( wrapper.vm.mimeType ).toBe( imageSampleResult.imageinfo[ 0 ].mime );
			} );
		} );
		describe( 'mimeType', () => {
			it( 'Returns empty object if mediatype is image', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					}
				} );

				expect( wrapper.vm.playerOptions ).toEqual( {} );
			} );
			it( 'Returns object if mediatype is audio', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: videoSampleResult.title,
						canonicalurl: videoSampleResult.canonicalurl,
						videoinfo: videoSampleResult.videoinfo,
						mediaType: 'audio',
						isDialog: false
					}
				} );

				expect( wrapper.vm.playerOptions ).toMatchObject(
					expect.objectContaining( {
						autoplay: false,
						controls: true,
						fluid: true,
						poster: videoSampleResult.videoinfo[ 0 ].thumburl,
						sources: videoSampleResult.videoinfo[ 0 ].derivatives
					} )
				);
			} );
			it( 'Returns object if mediatype is video', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: videoSampleResult.title,
						canonicalurl: videoSampleResult.canonicalurl,
						videoinfo: videoSampleResult.videoinfo,
						mediaType: 'video',
						isDialog: false
					}
				} );

				expect( wrapper.vm.playerOptions ).toMatchObject(
					expect.objectContaining( {
						autoplay: false,
						controls: true,
						fluid: true,
						poster: videoSampleResult.videoinfo[ 0 ].thumburl,
						sources: videoSampleResult.videoinfo[ 0 ].derivatives
					} )
				);
			} );
		} );
	} );

	describe( 'Methods', () => {
		describe( 'close', () => {
			describe( 'When triggered by keyboard', () => {
				it( 'emit a "close" event', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );

					// When the event is triggered by keyboard, it will have a details props of 0
					const event = {
						detail: 0
					};

					wrapper.vm.close( event );
					expect( wrapper.emitted().close ).toHaveLength( 1 );
				} );
				it( 'provide a boolean argument with emitted value', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );

					// When the event is triggered by keyboard, it will have a details props of 0
					const event = {
						detail: 0
					};

					wrapper.vm.close( event );
					expect( wrapper.emitted().close[ 0 ] ).toEqual( [ true ] );
				} );
			} );
			describe( 'When triggered by mouse', () => {
				it( 'emit a "close" event', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );
					wrapper.vm.close( {} );
					expect( wrapper.emitted().close ).toHaveLength( 1 );
				} );
			} );
		} );
		describe( 'getLicenseIcon', () => {
			describe( 'Returns logoCC icon', () => {
				it( 'when licence name starts with "cc"', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );
					const generatedLicense = wrapper.vm.getLicenseIcon( 'ccTest' );
					expect( generatedLicense ).toEqual( icons.cdxIconLogoCC );
				} );
				it( 'when licence name starts with "attribution"', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );
					const generatedLicense = wrapper.vm.getLicenseIcon( 'attribution' );
					expect( generatedLicense ).toEqual( icons.cdxIconLogoCC );
				} );
			} );
			describe( 'Returns cdxIconUnlock icon', () => {
				it( 'when licence name starts with "pd"', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );
					const generatedLicense = wrapper.vm.getLicenseIcon( 'pdTest' );
					expect( generatedLicense ).toEqual( icons.cdxIconUnLock );
				} );
				it( 'when licence name starts with "no restrictions"', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );
					const generatedLicense = wrapper.vm.getLicenseIcon( 'no restrictions' );
					expect( generatedLicense ).toEqual( icons.cdxIconUnLock );
				} );
			} );
			describe( 'Returns cdxIconReference icon', () => {
				it( 'when licence name is uknown"', () => {
					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );
					const generatedLicense = wrapper.vm.getLicenseIcon( 'unknown license' );
					expect( generatedLicense ).toEqual( icons.cdxIconReference );
				} );
			} );
		} );
		describe( 'getThumbnailWrapperStyle', () => {
			describe( 'when image is landscape', () => {
				it( 'set thumbnailWrapperStyle values', () => {
					// set image to be landscape
					imageSampleResult.imageinfo[ 0 ].width = 1000;
					imageSampleResult.imageinfo[ 0 ].height = 500;

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );
					wrapper.vm.getThumbnailWrapperStyle();
					expect( wrapper.vm.thumbnailWrapperStyle ).toEqual(
						{
							height: '30px',
							width: '100%'
						}
					);
				} );
			} );
			describe( 'when image is portrait', () => {
				it( 'set thumbnailWrapperStyle values', () => {
					// set image to be portrait
					imageSampleResult.imageinfo[ 0 ].width = 500;
					imageSampleResult.imageinfo[ 0 ].height = 1000;

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );
					wrapper.vm.getThumbnailWrapperStyle();
					expect( wrapper.vm.thumbnailWrapperStyle ).toEqual(
						{
							height: '30px',
							width: '100%'
						}
					);
				} );
			} );
			describe( 'when height is less than 100', () => {
				it( 'set isExtraSmall to true', () => {
					imageSampleResult.imageinfo[ 0 ].width = 20;
					imageSampleResult.imageinfo[ 0 ].height = 1000;

					const wrapper = shallowMount( QuickView, {
						props: {
							title: imageSampleResult.title,
							canonicalurl: imageSampleResult.canonicalurl,
							imageinfo: imageSampleResult.imageinfo,
							mediaType: 'image',
							isDialog: false
						}
					} );
					wrapper.vm.getThumbnailWrapperStyle();
					expect( wrapper.vm.isExtraSmall ).toBeTruthy();
				} );
			} );
		} );
		describe( 'onThumbnailLoad', () => {
			it( 'sets thumbnailWrapperStyle to false', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					}
				} );
				wrapper.vm.onThumbnailLoad();
				expect( wrapper.vm.thumbnailWrapperStyle ).toBeFalsy();
			} );
		} );
		describe( 'onPlay', () => {
			it( 'logs a quickview_media_play action', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					},
					mocks: {
						$log: jest.fn()
					}
				} );

				wrapper.vm.onPlay();
				expect( wrapper.vm.$log.mock.calls[ 0 ][ 0 ].action ).toEqual( 'quickview_media_play' );
			} );
		} );
		describe( 'handleFilenameCopy', () => {
			it( 'logs a quickview_filename_copy action', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					},
					mocks: {
						$log: jest.fn()
					}
				} );

				wrapper.vm.handleFilenameCopy();
				expect( wrapper.vm.$log.mock.calls[ 0 ][ 0 ].action ).toEqual( 'quickview_filename_copy' );
			} );
		} );
		describe( 'handleWikitextCopy', () => {
			it( 'logs a quickview_wikitext_link_copy action', () => {
				const wrapper = shallowMount( QuickView, {
					props: {
						title: imageSampleResult.title,
						canonicalurl: imageSampleResult.canonicalurl,
						imageinfo: imageSampleResult.imageinfo,
						mediaType: 'image',
						isDialog: false
					},
					mocks: {
						$log: jest.fn()
					}
				} );

				wrapper.vm.handleWikitextCopy();
				expect( wrapper.vm.$log.mock.calls[ 0 ][ 0 ].action ).toEqual( 'quickview_wikitext_link_copy' );
			} );
		} );
	} );
	describe( 'mounted', () => {
		it( 'show spinner after timeout', () => {
			jest.useFakeTimers();

			const wrapper = shallowMount( QuickView, {
				props: {
					title: imageSampleResult.title,
					canonicalurl: imageSampleResult.canonicalurl,
					imageinfo: imageSampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				},
				mocks: {
					$log: jest.fn()
				}
			} );

			expect( wrapper.vm.showSpinner ).toBeFalsy();
			jest.runAllTimers();
			expect( wrapper.vm.showSpinner ).toBeTruthy();
		} );
	} );
} );
