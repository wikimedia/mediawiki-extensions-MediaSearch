/* eslint-disable compat/compat */
var IntersectionObserverSpies = {
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn()
};

// you can also pass the mock implementation
// to jest.fn as an argument
window.IntersectionObserver = jest.fn( () => ( {
	observe: IntersectionObserverSpies.observe,
	unobserve: IntersectionObserverSpies.unobserve,
	disconnect: IntersectionObserverSpies.disconnect
} ) );

module.exports = IntersectionObserverSpies;
