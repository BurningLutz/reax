/**
 * Create reducer for a certain type.
 *
 * @param {String} type handling type
 * @param {Function|Object} reducer reducer to use. This could be neither a function or
 * a function map coresponding to an async action creator's shape
 * @param {Any} [ds={}] default state
 * @returns {Function} reducer
 */
function _ha(type, reducer, ds = {}) {
  return (state = ds, action) => {
    if (action.type !== type) {
      return state
    }

    if (reducer instanceof Function) {
      return reducer(state, action)
    }

    const { pending, resolve, reject } = reducer
    if (!action.status && pending) {
      return pending(state, action)
    }
    if (action.status === 'resolved' && resolve) {
      return resolve(state, action)
    }
    if (action.status === 'rejected' && reject) {
      return reject(state, action)
    }

    throw 'No correct reducer provided.'
  }
}

/**
 * Create reducer for a group of action types.
 *
 * @param {Object} reducerMap a type=>reducer map
 * @param {Any} [ds={}] default state
 * @returns {Function} reducer
 */
function _haa(reducerMap, ds = {}) {
  let wrapped = {}
  for (let type in reducerMap) {
    wrapped[type] = _ha(type, reducerMap[type])
  }
  return (state = ds, action) => wrapped.hasOwnProperty(action.type) ? wrapped[action.type](state, action) : state
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
export default function ha(...args) {
  return typeof args[0] === 'string' ? _ha(...args) : _haa(...args)
}
