'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionLink = exports.Fragment = exports.installBrowserRouter = undefined;

var _historyEvents = require('./history-events');

var _historyEvents2 = _interopRequireDefault(_historyEvents);

var _changeUrlEvent = require('./change-url-event');

var _changeUrlEvent2 = _interopRequireDefault(_changeUrlEvent);

var _actionRouter = require('./action-router');

var _actionRouter2 = _interopRequireDefault(_actionRouter);

var _fragment = require('./fragment');

var _fragment2 = _interopRequireDefault(_fragment);

var _actionLink = require('./action-link');

var _actionLink2 = _interopRequireDefault(_actionLink);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _historyEvents2.default)(window, window.history);
(0, _changeUrlEvent2.default)(window);

var installBrowserRouter = function installBrowserRouter(routesConfig) {
  return (0, _actionRouter2.default)(routesConfig, window);
};

exports.installBrowserRouter = installBrowserRouter;
exports.Fragment = _fragment2.default;
exports.ActionLink = _actionLink2.default;