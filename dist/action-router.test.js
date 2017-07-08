'use strict';

var _redux = require('redux');

var _actionRouter = require('./action-router');

var _actionRouter2 = _interopRequireDefault(_actionRouter);

var _changeUrlEvent = require('./change-url-event.js');

var _changeUrlEvent2 = _interopRequireDefault(_changeUrlEvent);

var _historyEvents = require('./history-events.js');

var _historyEvents2 = _interopRequireDefault(_historyEvents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var console_log = console.log;
console.log = function () {};
function with_console(cb) {
  console.log = console_log;
  try {
    cb();
  } catch (e) {
    console.log = function () {};
    throw e;
  }
  console.log = function () {};
}

function createLocation(path) {
  return {
    hash: '#hash',
    host: 'example.com',
    hostname: 'example',
    origin: '',
    href: '',
    pathname: path,
    port: 80,
    protocol: 'https:'
  };
}

function createFakeWindow() {
  var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/path/to/thing';

  var locations = [createLocation('(root)')];
  function pushLocation(window, path) {
    var newLoc = createLocation(path);
    locations.push(newLoc);
    window.location = newLoc;
    return newLoc;
  }
  function popLocation(window) {
    locations.pop();
    var newLoc = locations[locations.length - 1];
    window.location = newLoc;
    return newLoc;
  }

  var window = {
    history: {
      pushState: jest.fn(function (_, __, path) {
        window.location = pushLocation(window, path);
      }),
      replaceState: jest.fn()
    }
  };

  pushLocation(window, path);
  var map = {};

  window.addEventListener = jest.fn(function (event, cb) {
    map[event] = cb;
  });

  function prepareEvent(window, evName) {
    if (evName == 'popstate') {
      window.location = popLocation(window);
    }
  }

  window.dispatchEvent = jest.fn(function (ev) {
    var evName = ev.type;
    if (map[evName]) {
      prepareEvent(window, evName);
      map[evName].handleEvent(ev);
    }
  });

  return window;
}

function setupTest(routesConfig) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/path/to/thing';

  var window = createFakeWindow(path);
  var mockPushState = window.history.pushState;
  (0, _historyEvents2.default)(window, window.history);
  (0, _changeUrlEvent2.default)(window, window.history);

  var _installBrowserRouter = (0, _actionRouter2.default)(routesConfig, window),
      middleware = _installBrowserRouter.middleware,
      enhancer = _installBrowserRouter.enhancer,
      init = _installBrowserRouter.init;

  var reduce = jest.fn();

  var store = (0, _redux.createStore)(reduce, (0, _redux.compose)(enhancer, (0, _redux.applyMiddleware)(middleware)));

  function urlChanges() {
    return mockPushState.mock.calls.map(function (item) {
      return item[2];
    });
  }

  function actionsDispatched() {
    return reduce.mock.calls.map(function (item) {
      return item[1];
    }).slice(1);
  }

  function fireUrlChange(path) {
    window.dispatchEvent(new CustomEvent('urlchanged', { detail: createLocation(path) }));
  }

  return { store: store, reduce: reduce, window: window, urlChanges: urlChanges, actionsDispatched: actionsDispatched, fireUrlChange: fireUrlChange, init: init };
}

it("router handles exact match in preference to wildcard match", function () {
  //given
  var actionType = 'THE_ACTION';
  var action = { type: actionType, id: 1 };
  var routesConfig = [["/somewhere/:id", actionType, {}], ["/somewhere", actionType, { id: 1 }]];

  var _setupTest = setupTest(routesConfig),
      urlChanges = _setupTest.urlChanges,
      store = _setupTest.store;

  // when


  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(['/somewhere']);
});

it("router doees not dispatch an action from url change that is caused by action dispatch", function () {
  //given
  var actionType = 'THE_ACTION';
  var id = "1";
  var view = "home";
  var action = { type: actionType, id: id, view: view };
  var routesConfig = [["/somewhere/:id/:view", actionType, {}], ["/somewhere/:id/default", actionType, { view: "home" }]];

  var _setupTest2 = setupTest(routesConfig),
      urlChanges = _setupTest2.urlChanges,
      store = _setupTest2.store,
      actionsDispatched = _setupTest2.actionsDispatched,
      init = _setupTest2.init;

  // when


  store.dispatch(action);

  // then
  expect(actionsDispatched()).toEqual([action]);
});

it("popstate doesn't cause a pushstate", function () {
  //given
  var actionType = 'THE_ACTION';
  var id = "1";
  var view = "home";
  var action = { type: actionType, id: id, view: view };
  var routesConfig = [["/somewhere/:id/:view", actionType, {}], ["/somewhere/:id/default", actionType, { view: "home" }]];

  var _setupTest3 = setupTest(routesConfig, '/somewhere/foo/default'),
      urlChanges = _setupTest3.urlChanges,
      store = _setupTest3.store,
      actionsDispatched = _setupTest3.actionsDispatched,
      fireUrlChange = _setupTest3.fireUrlChange,
      init = _setupTest3.init,
      window = _setupTest3.window;

  init();
  window.history.pushState({}, '', '/somwhere/bar/default');

  // when
  window.dispatchEvent(new CustomEvent('popstate', {}));

  // then
  expect(urlChanges().length).toEqual(1);
});

it("router handles wildcard with extra args correctly", function () {

  //given
  var actionType = 'THE_ACTION';
  var action = { type: actionType, id: 1, view: "home" };
  var routesConfig = [["/somewhere/:id/:view", actionType, {}], ["/somewhere/:id/default", actionType, { view: "home" }]];

  var _setupTest4 = setupTest(routesConfig),
      urlChanges = _setupTest4.urlChanges,
      store = _setupTest4.store;

  // when


  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(['/somewhere/1/default']);
});

it("router handles wildcard with extraArgs correctly with reverse order", function () {

  //given
  var actionType = 'THE_ACTION';
  var action = { type: actionType, id: 1, view: "home" };
  var routesConfig = [["/somewhere/:id/default", actionType, { view: "home" }], ["/somewhere/:id/:view", actionType, {}]];

  var _setupTest5 = setupTest(routesConfig),
      urlChanges = _setupTest5.urlChanges,
      store = _setupTest5.store;

  // when


  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(['/somewhere/1/default']);
});

it("router handles wildcard without extraArgs correctly", function () {

  //given
  var actionType = 'THE_ACTION';
  var action = { type: actionType, id: 1 };
  var routesConfig = [["/somewhere/:id/default", actionType, {}]];

  var _setupTest6 = setupTest(routesConfig),
      urlChanges = _setupTest6.urlChanges,
      store = _setupTest6.store;

  // when


  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(['/somewhere/1/default']);
});

it("router handles wildcard with no match correctly", function () {

  //given
  var actionType = 'THE_ACTION';
  var action = { type: actionType, foo: 1 };
  var routesConfig = [["/somewhere/:id/default", actionType, {}]];

  var _setupTest7 = setupTest(routesConfig),
      urlChanges = _setupTest7.urlChanges,
      store = _setupTest7.store;

  // when


  store.dispatch(action);

  // then ( no url changes triggered)
  expect(urlChanges()).toEqual([]);
});

it("router does not match when all args are not accounted for", function () {
  //given
  var actionType = 'THE_ACTION';
  var action = { type: actionType, id: 1, view: "home" };
  var routesConfig = [["/somewhere/:id/default", actionType, {}]];

  var _setupTest8 = setupTest(routesConfig),
      urlChanges = _setupTest8.urlChanges,
      store = _setupTest8.store;

  // when


  store.dispatch(action);

  // then ( no url changes triggered)
  expect(urlChanges()).toEqual([]);
});

it("router should match non-wildcard route in preference to wildcard route", function () {
  // given
  var routesConfig = [['/somewhere/:id', 'ACTION_NAME', {}], ["/somewhere/specific", 'ACTION_NAME', { id: 1 }]];

  var _setupTest9 = setupTest(routesConfig),
      actionsDispatched = _setupTest9.actionsDispatched,
      fireUrlChange = _setupTest9.fireUrlChange;

  // when


  fireUrlChange('/somewhere/specific');

  // then
  expect(actionsDispatched()).toEqual([{ type: 'ACTION_NAME', id: 1 }]);
});

it("router should throw on duplicate paths", function () {
  // given
  var routesConfig = [['/somewhere/:id', 'ACTION_NAME', {}], ["/somewhere/:id", 'ACTION_NAME', {}]];

  expect(function () {
    setupTest(routesConfig);
  }).toThrow();
});

it("router should throw on equally specific routes", function () {
  // given
  var routesConfig = [['/somewhere/:id', 'ACTION_NAME', {}], ["/somewhere/:specific", 'ACTION_NAME', {}]];

  expect(function () {
    setupTest(routesConfig);
  }).toThrow();
});

it("router should match less-wildcarded routes in preference to more wildcarded routes", function () {
  //given
  var routesConfig = [["/somewhere/:id/:view/:bar", "ACTION_NAME", {}], ["/somewhere/:foo/:id/:view/:baz", "ACTION_NAME", {}]];

  var _setupTest10 = setupTest(routesConfig),
      actionsDispatched = _setupTest10.actionsDispatched,
      fireUrlChange = _setupTest10.fireUrlChange;

  // when


  fireUrlChange('/somewhere/specific/etc/bar');

  // then
  expect(actionsDispatched()).toEqual([{ type: 'ACTION_NAME', id: "specific", view: "etc", bar: "bar" }]);
});

it("router should propagate matches through non-matching cases", function () {
  //given
  var routesConfig = [["/somewhere/specific/:view", "ACTION_NAME", { id: 1 }], ["/somewhere/:id/:view", "ACTION_NAME", {}], ["/not/a/match", "ACTION_NAME", {}]];

  var _setupTest11 = setupTest(routesConfig),
      actionsDispatched = _setupTest11.actionsDispatched,
      fireUrlChange = _setupTest11.fireUrlChange;

  // when


  fireUrlChange('/somewhere/specific/etc');

  // then
  expect(actionsDispatched()).toEqual([{ type: 'ACTION_NAME', id: 1, view: "etc" }]);
});

it("router should give precedence to exact match first in equally-specific routes (/a/:b vs /:a/b)", function () {
  // given
  var routesConfig = [["/something/:dynamic", "ACTION_NAME", {}], ["/:dyn/something", "ACTION_NAME", {}]];

  var _setupTest12 = setupTest(routesConfig),
      actionsDispatched = _setupTest12.actionsDispatched,
      fireUrlChange = _setupTest12.fireUrlChange;

  // when


  fireUrlChange("/something/something");

  // then
  expect(actionsDispatched()).toEqual([{ type: 'ACTION_NAME', dynamic: 'something' }]);
});

it("router handles the current location when initialized", function () {
  // given
  var routesConfig = [["/something/:dynamic", "ACTION_NAME", {}], ["/:dyn/something", "ACTION_NAME", {}]];

  // when
  /// We break the pattern because we're testing store construction.

  var _setupTest13 = setupTest(routesConfig, '/something/something'),
      actionsDispatched = _setupTest13.actionsDispatched,
      init = _setupTest13.init;

  init();

  // then
  expect(actionsDispatched()).toEqual([{ type: 'ACTION_NAME', dynamic: 'something' }]);
});

it("pathForAction should render a route", function () {
  // given
  var routesConfig = [["/something/:dynamic", "ACTION_NAME", {}], ["/:dyn/something", "ACTION_NAME", {}]];
  var action = { type: 'ACTION_NAME', dynamic: 'hooray' };

  var _setupTest14 = setupTest(routesConfig),
      store = _setupTest14.store;
  // when


  var actual = store.pathForAction(action);

  // then
  expect(actual).toEqual('/something/hooray');
});

console.log = console_log;