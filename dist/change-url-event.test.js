'use strict';

var _changeUrlEvent = require('./change-url-event');

var _changeUrlEvent2 = _interopRequireDefault(_changeUrlEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

it("it should add changeUrlEventCreator to popstate,pushstate,replacestate", function () {
  // given
  var window = {};
  var map = {};

  window.addEventListener = jest.fn(function (event, cb) {
    map[event] = cb;
  });

  // when
  (0, _changeUrlEvent2.default)(window);

  // then
  expect(map['popstate']).toBeDefined();
  expect(map['pushstate']).toBeDefined();
  expect(map['replacestate']).toBeDefined();
});

it("given event handler should generate a urlchange event only when url changes", function () {
  // given
  var window = {
    location: {
      hash: '#hash',
      host: 'example.com',
      hostname: 'example',
      origin: '',
      href: '',
      pathname: '/path/to/thing',
      port: 80,
      protocol: 'https:'
    }
  };
  var map = {};
  var calls = [];

  window.addEventListener = jest.fn(function (event, cb) {
    map[event] = cb;
  });

  window.dispatchEvent = jest.fn(function (ev) {
    var evName = ev.type;
    calls.push(ev);
    if (map[evName]) {
      map[evName].handleEvent(ev);
    }
  });

  // when
  (0, _changeUrlEvent2.default)(window);
  window.dispatchEvent(new Event('popstate'));
  window.dispatchEvent(new Event('popstate'));

  // then
  expect(calls.length).toEqual(3);
  expect(calls[1].type).toEqual('urlchanged');
  expect(calls[1].detail).toEqual(window.location);

  //when
  window.location.pathname = '/new/path';
  window.dispatchEvent(new Event('popstate'));

  //then
  expect(calls.length).toEqual(5);
  expect(calls[4].type).toEqual('urlchanged');
  expect(calls[4].detail).toEqual(window.location);
});

it("should only add url events 1x when addChangeUrlEvent is called on window more than 1x", function () {
  // given
  var window = {};
  var map = {};

  window.addEventListener = jest.fn(function (event, cb) {
    if (!map[event]) {
      map[event] = [];
    }
    map[event].push(cb);
  });

  // when
  (0, _changeUrlEvent2.default)(window);
  (0, _changeUrlEvent2.default)(window);
  (0, _changeUrlEvent2.default)(window);

  expect(Object.keys(map).length).toEqual(3);
  //then
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(map)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var event = _step.value;

      expect(map[event].length).toEqual(1);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
});