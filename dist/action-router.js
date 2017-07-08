'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = installBrowserRouter;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function pathSplit(path) {
  return path.split('/');
}

function mostSpecificRouteMatch(match1, match2) {

  if (!match1) {
    return match2;
  }

  var paramLength1 = match1.routeParams.length;
  var paramLength2 = match2.routeParams.length;
  var findWildcard = _ramda2.default.compose(_ramda2.default.findIndex.bind(_ramda2.default, isWildcard), pathSplit);

  var result = paramLength1 > paramLength2 ? match2 : match1;

  if (paramLength1 === paramLength2) {

    var path1WildcardIdx = findWildcard(match1.path);
    var path2WildcardIdx = findWildcard(match2.path);

    result = path1WildcardIdx !== -1 && path1WildcardIdx < path2WildcardIdx ? match2 : match1;
  }

  if (result === null) {
    throw new Error("routes should have been disambiguated at compile time");
  }

  return result;
}

// do something with routes.
function matchRoute(loc, matchers) {

  var inputPath = loc.pathname;

  var buildMatch = function buildMatch(extractedParams, route) {
    return Object.assign({ extractedParams: extractedParams }, route);
  };

  return _ramda2.default.toPairs(matchers).reduce(function (match, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        path = _ref2[0],
        _ref2$ = _ref2[1],
        matcherType = _ref2$.type,
        route = _ref2$.route;

    var pathMatcher = route.routeMatcher;
    var matchedParams = pathMatcher(inputPath);

    if (matchedParams) {
      if (matcherType === 'exact') {
        return buildMatch(matchedParams, route);
      } else {
        return mostSpecificRouteMatch(match, buildMatch(matchedParams, route));
      }
    } else {
      return match;
    }
  }, null);
}

function mostSpecificActionMatch(match1, match2) {

  if (!match1) {
    return match2;
  }

  var countExtraParams = function countExtraParams(_ref3) {
    var obj = _ref3.extraParams;
    return Object.keys(obj).length;
  };
  return countExtraParams(match1) >= countExtraParams(match2) ? match1 : match2;
}

// matchers is {action : [routeMatcher]} structure
function matchAction(action, matchers) {
  // match on params in action vs possible actions if more than 1
  var match = null;

  var actionType = action.type,
      args = _objectWithoutProperties(action, ['type']);

  var routes = matchers[actionType];

  // Specificity:
  // 1. wildcard(s) / no extra param   /route/:id  || /route/me
  // 2. wildcards /  exact extra params match with remaining wildcard
  // 3. no-wildcard / exact extra params match

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = routes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref4 = _step.value;
      var matcherType = _ref4.type,
          route = _ref4.route;

      if (matcherType === "exact" && _ramda2.default.equals(route.extraParams, args)) {
        match = Object.assign({ extractedParams: {} }, route);
        // case 3
        break; // most specific
      } else if (matcherType === "wildcard") {
        // case 1+2

        var unallocatedArgKeys = _ramda2.default.difference(Object.keys(args), Object.keys(route.extraParams));
        // if all keys ^ are equal to all keys in route
        var intersectCount = _ramda2.default.intersection(unallocatedArgKeys, route.routeParams).length;
        var unionCount = _ramda2.default.union(unallocatedArgKeys, route.routeParams).length;

        if (intersectCount === unionCount) {
          var extractedParams = _ramda2.default.pick(unallocatedArgKeys, args);
          match = mostSpecificActionMatch(match, Object.assign({ extractedParams: extractedParams }, route));
        }
      }
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

  return match;
}

function matchesAction(action, matchers) {
  return !!matchers[action.type];
}

function isWildcard(segment) {
  return segment && segment[0] === ":";
}

function extractParams(path) {
  var pathParts = path.split("/");
  var params = [];

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = pathParts.filter(isWildcard)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var part = _step2.value;

      var name = part.slice(1);

      if (params.indexOf(name) !== -1) {
        throw new Error("duplicate param");
      }

      params.push(name);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return params;
}

function normalizePathParts(path) {
  var rawPathParts = _ramda2.default.split('/', path);
  var normalizedPathParts = _ramda2.default.filter(function (p) {
    return p !== "";
  }, rawPathParts);
  return normalizedPathParts;
}

function makeRoute(path, action, extraParams) {

  var type = "exact";
  if (path.indexOf(":") !== -1) {
    type = "wildcard";
  }

  var normalizedPathParts = normalizePathParts(path);

  var updateWildcard = function updateWildcard(wildcards, match, input) {
    var wildcardName = match.replace(':', '');
    return Object.assign(wildcards, _defineProperty({}, wildcardName, input));
  };

  var routeMatcher = function routeMatcher(inputPath) {
    var result = null;
    var normMatchPath = normalizedPathParts;
    var normInputPath = normalizePathParts(inputPath);

    // exact match
    if (_ramda2.default.equals(normalizedPathParts, normInputPath)) {
      return {};
    }

    //wildcard match
    var inputLength = normInputPath.length;
    var matchLength = normMatchPath.length;

    if (inputLength === matchLength) {
      var f = function f(acc, _ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            match = _ref6[0],
            input = _ref6[1];

        if (acc === null) {
          return null;
        }

        if (match === input) {
          return acc;
        } else if (match[0] === ":") {
          return updateWildcard(acc, match, input);
        } else {
          return null;
        }
      };
      result = _ramda2.default.zip(normMatchPath, normInputPath).reduce(f, {});
    }

    return result;
  };

  var routeParams = extractParams(path);

  return {
    type: type,
    route: {
      routeMatcher: routeMatcher,
      path: path,
      action: action,
      routeParams: routeParams,
      extraParams: extraParams
    }
  };
}

function normalizeWildcards(path) {
  var curIdx = 0;
  return path.map(function (el) {
    if (isWildcard(el)) {
      return ':wildcard' + curIdx;
    } else {
      return el;
    }
  });
}

function routeAlreadyExists(compiledRouteMatchers, path) {
  var result = compiledRouteMatchers.hasOwnProperty(path);

  if (!result) {
    var normalizingSplit = _ramda2.default.compose(normalizeWildcards, pathSplit);
    var pathParts = normalizingSplit(path);

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = Object.keys(compiledRouteMatchers)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var otherPath = _step3.value;

        var otherPathParts = normalizingSplit(otherPath);
        if (_ramda2.default.equals(pathParts, otherPathParts)) {
          throw new Error('invalid routing configuration \u2014 route ' + path + ' overlaps with route ' + otherPath);
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  }

  return result;
}

function compileRoutes(routesConfig) {
  var compiledActionMatchers = {};
  var compiledRouteMatchers = {};

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = routesConfig[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _ref7 = _step4.value;

      var _ref8 = _slicedToArray(_ref7, 3);

      var path = _ref8[0];
      var action = _ref8[1];
      var extraParams = _ref8[2];


      if (typeof path !== 'string' || typeof action !== 'string') {
        throw new Error("invalid routing configuration - path and action must both be strings");
      }

      if (!compiledActionMatchers[action]) {
        compiledActionMatchers[action] = [];
      }

      var route = makeRoute(path, action, extraParams);
      compiledActionMatchers[action].push(route);

      if (routeAlreadyExists(compiledRouteMatchers, path)) {
        throw new Error("overlapping paths");
      }

      compiledRouteMatchers[path] = route;
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  return {
    compiledActionMatchers: compiledActionMatchers, // { ACTION: [Route] }
    compiledRouteMatchers: compiledRouteMatchers // { PATH: Route }
  };
}

function constructAction(match) {
  return _extends({ type: match.action }, match.extractedParams, match.extraParams);
}

function constructPath(match) {
  var parts = match.path.split('/');
  var resultParts = [];

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = parts[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var part = _step5.value;

      if (part[0] === ":") {
        var name = part.slice(1);
        var val = match.extractedParams.hasOwnProperty(name) ? match.extractedParams[name] : match.extraParams[name];
        resultParts.push(val);
      } else {
        resultParts.push(part);
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  return resultParts.join('/');
}

function createActionDispatcher(routesConfig, window) {
  var _compileRoutes = compileRoutes(routesConfig),
      compiledActionMatchers = _compileRoutes.compiledActionMatchers,
      compiledRouteMatchers = _compileRoutes.compiledRouteMatchers;

  function pathForAction(action) {
    var match = matchAction(action, compiledActionMatchers);
    return match ? constructPath(match) : null;
  }

  var actionDispatcher = {
    currentLocation: null,

    store: null,
    activateDispatcher: function activateDispatcher(store) {
      window.addEventListener('urlchanged', this);
      this.store = store;
    },
    enhanceStore: function enhanceStore(nextStoreCreator) {
      var _this = this;

      return function (reducer, finalInitialState, enhancer) {
        var theStore = nextStoreCreator(reducer, finalInitialState, enhancer);
        _this.activateDispatcher(theStore);
        theStore.pathForAction = pathForAction;
        return theStore;
      };
    },
    handleEvent: function handleEvent(ev) {

      if (!this.store) {
        throw new Error("You must call activateDispatcher with redux store as argument");
      }

      var location = ev.detail;
      this.receiveLocation(location);
    },
    onLocationChanged: function onLocationChanged(newLoc, cb) {
      if (this.currentLocation !== newLoc) {
        this.currentLocation = newLoc;
        return cb();
      }
    },
    receiveLocation: function receiveLocation(location) {
      var _this2 = this;

      this.onLocationChanged(location.pathname, function () {
        var match = matchRoute(location, compiledRouteMatchers);
        if (match) {
          var action = constructAction(match);

          _this2.store.dispatch(action);
        }
      });
    },
    receiveAction: function receiveAction(action) {
      var matcher = matchAction(action, compiledActionMatchers);
      if (matcher) {
        var path = constructPath(matcher);
        this.onLocationChanged(path, function () {
          window.history.pushState({}, '', path);
        });
      }
    },
    handlesAction: function handlesAction(action) {
      return matchesAction(action, compiledActionMatchers);
    }
  };

  actionDispatcher.enhanceStore = actionDispatcher.enhanceStore.bind(actionDispatcher);

  return actionDispatcher;
}

function buildMiddleware(actionDispatcher) {
  return function (store) {
    return function (next) {
      return function (action) {
        if (actionDispatcher.handlesAction(action)) {
          actionDispatcher.receiveAction(action, store);
        }
        return next(action);
      };
    };
  };
}

function installBrowserRouter(routesConfig, window) {

  var actionDispatcher = createActionDispatcher(routesConfig, window);

  var middleware = buildMiddleware(actionDispatcher);

  return { middleware: middleware, enhancer: actionDispatcher.enhanceStore, init: actionDispatcher.receiveLocation.bind(actionDispatcher, window.location) };
}