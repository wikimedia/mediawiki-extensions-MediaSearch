/* eslint-disable compat/compat */
const nativePerformance = window.performance;

// Set the performance navigation by defining the NatigationTiming
// https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming/type
const mockPerformanceNavigation = ( type = 'navigate' ) => {
	window.performance.getEntriesByType = jest.fn().mockReturnValue(
		[ {
			type: type
		} ]
	);
};

const mockDeprecatedPerformanceNavigation = ( type = 1 ) => {
	window.performance.getEntriesByType = null;
	window.performance.navigation = {
		type: type
	};
};

const restorePerformance = () => {
	window.performance = nativePerformance;
};

module.exports = {
	mockPerformanceNavigation,
	mockDeprecatedPerformanceNavigation,
	restorePerformance
};
