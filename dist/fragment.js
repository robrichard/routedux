'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Fragment;
function Fragment(_ref) {
  var state = _ref.state,
      filterOn = _ref.filterOn,
      children = _ref.children;


  var parts = filterOn.split('.');
  var cur = parts.reduce(function (cur, next) {
    return cur ? cur[next] : cur;
  }, state);

  if (cur) {
    return children;
  } else {
    return null;
  }
}