"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addMissingHistoryEvents;

function polyfillCustomEvent() {

  if (typeof window.CustomEvent === "function") return false;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
};

function debounce(object, flag, cb) {
  if (!object[flag]) {
    object[flag] = true;
    cb();
  }
}

var MISSING_HISTORY = Symbol("missing_history");
function addMissingHistoryEvents(window, history) {
  debounce(history, MISSING_HISTORY, function () {

    var pushState = history.pushState.bind(history);
    var replaceState = history.replaceState.bind(history);

    polyfillCustomEvent();

    history.pushState = function (state, title, url) {
      var result = pushState.apply(undefined, arguments);

      var pushstate = new CustomEvent('pushstate', { detail: { state: state, title: title, url: url } });
      window.dispatchEvent(pushstate);
      return result;
    };

    history.replaceState = function (state, title, url) {
      var result = replaceState.apply(undefined, arguments);

      var replacestate = new CustomEvent('replacestate', { detail: { state: state, title: title, url: url } });
      window.dispatchEvent(replacestate);
      return result;
    };
  });
}