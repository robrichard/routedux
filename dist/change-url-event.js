'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapEvent = wrapEvent;
exports.default = addChangeUrlEvent;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function wrapEvent(target, name, obj) {
  target.addEventListener(name, obj);
}

function debounce(object, flag, cb) {
  if (!object[flag]) {
    object[flag] = true;
    cb();
  }
}

var MISSING_CHANGE_URL = Symbol("missing_change_url");
function addChangeUrlEvent(window) {

  debounce(window, MISSING_CHANGE_URL, function () {
    var changeUrlEventCreator = {
      lastLocation: null,
      handleEvent: function handleEvent(ev) {
        // interface for EventListener

        var _ref = window.location || {},
            hash = _ref.hash,
            host = _ref.host,
            hostname = _ref.hostname,
            origin = _ref.origin,
            href = _ref.href,
            pathname = _ref.pathname,
            port = _ref.port,
            protocol = _ref.protocol;
        // store in object for comparison


        var pushedLocation = { hash: hash, host: host, hostname: hostname, origin: origin, href: href, pathname: pathname, port: port, protocol: protocol };

        // only dispatch action when url has actually changed so same link can be clicked repeatedly.
        if (!_ramda2.default.equals(pushedLocation, this.lastLocation)) {
          var urlChangeEvent = new CustomEvent('urlchanged', { detail: pushedLocation });
          window.dispatchEvent(urlChangeEvent);
          this.lastLocation = pushedLocation;
        }
      }
    };

    // / make sure we fire urlchanged for these
    wrapEvent(window, 'popstate', changeUrlEventCreator);
    wrapEvent(window, 'pushstate', changeUrlEventCreator);
    wrapEvent(window, 'replacestate', changeUrlEventCreator);
  });
}