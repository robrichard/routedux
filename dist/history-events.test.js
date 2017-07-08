'use strict';

var _historyEvents = require('./history-events');

var _historyEvents2 = _interopRequireDefault(_historyEvents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

it("should overwrite pushstate and replacestate with event-emitting functions", function () {
  // given
  var pushState = jest.fn();
  var replaceState = jest.fn();
  var window = {
    dispatchEvent: jest.fn(),
    history: {
      pushState: pushState,
      replaceState: replaceState
    }
  };

  // when
  (0, _historyEvents2.default)(window, window.history);
  window.history.pushState({ item: 'push' }, 'pushstate', '/pushstate');
  window.history.replaceState({ item: 'replace' }, 'replacestate', '/replacestate');

  //then
  expect(pushState.mock.calls).toEqual([[{ item: 'push' }, 'pushstate', '/pushstate']]);
  expect(replaceState.mock.calls).toEqual([[{ item: 'replace' }, 'replacestate', '/replacestate']]);
  expect(window.dispatchEvent.mock.calls.length).toEqual(2);
  var windowCalls = window.dispatchEvent.mock.calls;

  expect(windowCalls[0][0].detail).toEqual({ state: { item: 'push' }, title: 'pushstate', url: '/pushstate' });
  expect(windowCalls[1][0].detail).toEqual({ state: { item: 'replace' }, title: 'replacestate', url: '/replacestate' });
});

it("should only add history-events once if called any number of times on same objects", function () {
  // given
  var pushState = jest.fn();
  var replaceState = jest.fn();
  var window = {
    dispatchEvent: jest.fn(),
    history: {
      pushState: pushState,
      replaceState: replaceState
    }
  };

  // when
  (0, _historyEvents2.default)(window, window.history);
  (0, _historyEvents2.default)(window, window.history);
  (0, _historyEvents2.default)(window, window.history);
  (0, _historyEvents2.default)(window, window.history);

  window.history.pushState({ item: 'push' }, 'pushstate', '/pushstate');
  window.history.replaceState({ item: 'replace' }, 'replacestate', '/replacestate');

  //then
  expect(window.dispatchEvent.mock.calls.length).toEqual(2);
});