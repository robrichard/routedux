"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// Ugly way to deal with optional dependency so we don't break projects not using react.
var React = null;

var ActionLink = function ActionLink(_ref, _ref2) {
  var store = _ref2.store;

  var action = _ref.action,
      children = _ref.children,
      props = _objectWithoutProperties(_ref, ["action", "children"]);

  if (!React) {
    throw new Error("You cannot use ActionLink unless react is available");
  }

  if (!store) {
    throw new Error("You cannot use ActionLink without providing store via context (possibly using react-redux Provider?)");
  }

  var renderedRoute = store.pathForAction(action);

  return React.createElement(
    "a",
    _extends({ href: renderedRoute,
      onClick: function onClick(ev) {
        ev.preventDefault();
        store.dispatch(action);
      }
    }, props),
    children
  );
};

try {
  React = require('react');
  ActionLink.contextTypes = {
    store: React.PropTypes.object
  };
} catch (e) {}

exports.default = ActionLink;