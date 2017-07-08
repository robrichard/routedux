'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _fragment = require('./fragment');

var _fragment2 = _interopRequireDefault(_fragment);

var _enzymeToJson = require('enzyme-to-json');

var _enzymeToJson2 = _interopRequireDefault(_enzymeToJson);

var _enzyme = require('enzyme');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

it("should display when state is truthy", function () {
  // given
  var state = { property: true };
  // when

  var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(
    _fragment2.default,
    { state: state, filterOn: 'property' },
    _react2.default.createElement(
      'div',
      null,
      'Hello'
    )
  ));

  // then
  expect((0, _enzymeToJson2.default)(wrapper)).toMatchSnapshot();
});

it("should not display when state is falsy", function () {
  // given
  var state = { property: undefined };
  // when

  var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(
    _fragment2.default,
    { state: state, filterOn: 'property' },
    _react2.default.createElement(
      'div',
      null,
      'Hello'
    )
  ));

  // then
  expect((0, _enzymeToJson2.default)(wrapper)).toEqual(null);
});

it("should handle paths in the state tree", function () {
  // given
  var state = { property: { subproperty: true } };
  // when

  var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(
    _fragment2.default,
    { state: state, filterOn: 'property.subproperty' },
    _react2.default.createElement(
      'div',
      null,
      'Hello'
    )
  ));

  // then
  expect((0, _enzymeToJson2.default)(wrapper)).toMatchSnapshot();
});

it("should handle arrays in the state tree", function () {
  // given
  var state = { property: [{ bar: {} }] };
  // when

  var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(
    _fragment2.default,
    { state: state, filterOn: 'property.0.bar' },
    _react2.default.createElement(
      'div',
      null,
      'Hello'
    )
  ));

  // then
  expect((0, _enzymeToJson2.default)(wrapper)).toMatchSnapshot();
});

it("should be falsy if missing state tree", function () {
  // given
  var state = { property: { subproperty: true } };

  var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(
    _fragment2.default,
    { state: state, filterOn: 'property.missingproperty.something' },
    _react2.default.createElement(
      'div',
      null,
      'Hello'
    )
  ));

  expect((0, _enzymeToJson2.default)(wrapper)).toEqual(null);
});