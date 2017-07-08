'use strict';

var _actionLink = require('./action-link');

var _actionLink2 = _interopRequireDefault(_actionLink);

var _enzyme = require('enzyme');

var _enzymeToJson = require('enzyme-to-json');

var _enzymeToJson2 = _interopRequireDefault(_enzymeToJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

it("dispatches an action on click", function () {

  // given
  var store = {
    pathForAction: jest.fn(function () {
      return '/my/path';
    }),
    dispatch: jest.fn()
  };
  var props = {
    action: { type: 'ACTION', id: '123' },
    children: "Hello World!"
  };
  var context = { store: store };

  var wrapper = (0, _enzyme.mount)((0, _actionLink2.default)(props, context));
  // when
  wrapper.simulate('click');

  //then
  expect(store.pathForAction.mock.calls).toEqual([[{ type: 'ACTION', id: '123' }]]);
  expect(store.dispatch.mock.calls).toEqual([[{ type: 'ACTION', id: '123' }]]);
});

it("renders the url calculated by our internal function", function () {
  // given
  var store = {
    pathForAction: jest.fn(function () {
      return '/my/path';
    }),
    dispatch: jest.fn()
  };
  var props = {
    action: {},
    children: "Hello World!"
  };
  var context = { store: store };

  var wrapper = (0, _enzyme.mount)((0, _actionLink2.default)(props, context));

  expect((0, _enzymeToJson2.default)(wrapper)).toMatchSnapshot();
});

it("additional props are passed through", function () {
  // given
  var store = {
    pathForAction: jest.fn(function () {
      return '/my/path';
    }),
    dispatch: jest.fn()
  };
  var props = {
    action: {},
    children: "Hello World!",
    className: "foo"
  };
  var context = { store: store };

  var wrapper = (0, _enzyme.mount)((0, _actionLink2.default)(props, context));

  expect((0, _enzymeToJson2.default)(wrapper)).toMatchSnapshot();
});