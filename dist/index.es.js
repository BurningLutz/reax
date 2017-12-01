import PropTypes from 'prop-types';
import { PureComponent, createElement } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import isEqual from 'object-equal';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * An HOC to create auto-load components with essential hooks.
 *
 * @param {Object} hooks The hooks to trigger at different situation.
 * There are 4 hooks named:
 * - loadFn, the load function to call when component did mount.
 * - loadingFn, the loading function to call to determine whether datas
 *              are still loading when rendered.
 * - unloadFn?, the upload function to call if provided when component will unmount.
 * - reloadFn?, the reload function to call if provided when component will receive new props.
 * @returns {Component} Initable component
 */
function Initable(_ref) {
  var loadFn = _ref.loadFn,
      loadingFn = _ref.loadingFn,
      unloadFn = _ref.unloadFn,
      reloadFn = _ref.reloadFn;

  return function (WrappedComponent) {
    var connectDisplayName = 'Initable(' + getDisplayName(WrappedComponent) + ')';

    var Initable = function (_PureComponent) {
      _inherits(Initable, _PureComponent);

      function Initable() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, Initable);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Initable.__proto__ || Object.getPrototypeOf(Initable)).call.apply(_ref2, [this].concat(args))), _this), _this._store = _this.context.store, _this.onChangeState = function () {
          _this.forceUpdate(); // NOTE: Only for triggering update
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(Initable, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          this.subscriber = this._store.subscribe(this.onChangeState);
          this._store.dispatch(loadFn(this._store.getState(), this.props));
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          unloadFn && this._store.dispatch(unloadFn(this._store.getState(), this.props));
          this.subscriber();
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(props) {
          // this check is to ensure props DO changed.
          if (isEqual(this.props, props)) {
            return;
          }

          if (reloadFn) {
            this._store.dispatch(reloadFn(this._store.getState(), this.props, props));
          } else {
            unloadFn && this._store.dispatch(unloadFn(this._store.getState(), this.props));
            this._store.dispatch(loadFn(this._store.getState(), props));
          }
        }
      }, {
        key: 'render',
        value: function render() {
          return !loadingFn(this._store.getState(), this.props) && createElement(WrappedComponent, this.props);
        }
      }]);

      return Initable;
    }(PureComponent);

    Initable.displayName = connectDisplayName;
    Initable.WrappedComponent = WrappedComponent;
    Initable.contextTypes = {
      store: PropTypes.any.isRequired
    };

    return hoistStatics(Initable, WrappedComponent);
  };
}

/**
 * Generate a reducer to set value at key or keypath
 *
 * @param {String|Array<String>|Function} keyOrKeypathOrGetter A key or keypath to set value at.
 * If it is a function, it will be called with (state, action), and it should return key or keypath
 * @param {Function} [transform=x=>x] transformer to get transformed value to set
 * @returns {Function} the reducer
 */
function keyedReducer(keyOrKeypathOrGetter) {
  var transform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (x) {
    return x;
  };

  return function (state, action) {
    var keyarg = keyOrKeypathOrGetter;
    if (keyOrKeypathOrGetter instanceof Function) {
      keyarg = keyOrKeypathOrGetter(state, action);
    }
    var transformedValue = transform(action.payload);
    if (keyarg instanceof Array) {
      return state.setIn(keyarg, transformedValue);
    } else {
      return state.set(keyarg, transformedValue);
    }
  };
}

/**
 * Create an action object.
 *
 * @param {String} type action type
 * @param {Any} payload payload data
 * @param {String} status optional status to mark the action an async one
 * @returns {Object} action object
 */
function _ca(type, payload, status) {
  var action = { type: type, payload: payload };
  if (status) {
    action.status = status;
  }
  return action;
}

var _idOrSpread = function _idOrSpread() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.length > 1 ? args : args[0];
};
var spread = function spread() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return args;
};
/**
 * Create action creator.
 *
 * @param {String} type action type
 * @param {Function} [payload=_idOrSpread] payload creator
 * @param {String} status optional status for async action
 * @returns {Function} action creator
 */
function ca(type) {
  var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _idOrSpread;
  var status = arguments[2];

  return function () {
    return _ca(type, payload.apply(undefined, arguments), status);
  };
}

/**
 * Create async action creator.
 *
 * @param {String} type action type
 * @param {Function} [payload=_idOrSpread] payload creator
 * @returns {Object} shape of { pending, resolve, reject }, each field stands for the specific action creator
 */
function caa(type) {
  var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _idOrSpread;

  return {
    pending: ca(type, payload),
    resolve: ca(type, payload, 'resolved'),
    reject: ca(type, payload, 'rejected')
  };
}

/**
 * Create reducer for a certain type.
 *
 * @param {String} type handling type
 * @param {Function|Object} reducer reducer to use. This could be neither a function or
 * a function map coresponding to an async action creator's shape
 * @param {Any} [ds={}] default state
 * @returns {Function} reducer
 */
function _ha(type, reducer) {
  var ds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ds;
    var action = arguments[1];

    if (action.type !== type) {
      return state;
    }

    if (reducer instanceof Function) {
      return reducer(state, action);
    }

    var pending = reducer.pending,
        resolve = reducer.resolve,
        reject = reducer.reject;

    if (!action.status && pending) {
      return pending(state, action);
    }
    if (action.status === 'resolved' && resolve) {
      return resolve(state, action);
    }
    if (action.status === 'rejected' && reject) {
      return reject(state, action);
    }

    throw 'No correct reducer provided.';
  };
}

/**
 * Create reducer for a group of action types.
 *
 * @param {Object} reducerMap a type=>reducer map
 * @param {Any} [ds={}] default state
 * @returns {Function} reducer
 */
function _haa(reducerMap) {
  var ds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var wrapped = {};
  for (var type in reducerMap) {
    wrapped[type] = _ha(type, reducerMap[type]);
  }
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ds;
    var action = arguments[1];
    return wrapped.hasOwnProperty(action.type) ? wrapped[action.type](state, action) : state;
  };
}

/**
 * Create reducer smartly.
 *
 * There are two ways to use this function.
 *
 * ha('FOO', (state, action) => {})
 *
 * or
 *
 * ha({
 *   'FOO': (state, action) => {},
 *   'BAR': (state, action) => {}
 * })
 *
 * @param {Array} ...args args for creating reducer.
 * @returns {Function} reducer
 */
function ha() {
  return typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'string' ? _ha.apply(undefined, arguments) : _haa.apply(undefined, arguments);
}

function fromKeys(keys) {
  return keys.reduce(function (ret, k) {
    ret[k] = k;
    return ret;
  }, {});
}

function fromTypes(types, transformer) {
  if (transformer) {
    types = transformer(types);
  }

  return Object.keys(types).reduce(function (ret, type) {
    ret[type] = ca(types[type]);
    return ret;
  }, {});
}

export { Initable, ca, caa, fromKeys, fromTypes, ha, keyedReducer, spread };
