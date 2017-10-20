/**
 * Create an action object.
 *
 * @param {String} type action type
 * @param {Any} payload payload data
 * @param {String} status optional status to mark the action an async one
 * @returns {Object} action object
 */
function _ca(type, payload, status) {
  const action = { type, payload }
  if (status) {
    action.status = status
  }
  return action
}

const _idOrSpread = (...args) => args.length > 1 ? args : args[0]
export const spread = (...args) => args
/**
 * Create action creator.
 *
 * @param {String} type action type
 * @param {Function} [payload=_idOrSpread] payload creator
 * @param {String} status optional status for async action
 * @returns {Function} action creator
 */
export function ca(type, payload = _idOrSpread, status) {
  return (...args) => _ca(type, payload(...args), status)
}

/**
 * Create async action creator.
 *
 * @param {String} type action type
 * @param {Function} [payload=_idOrSpread] payload creator
 * @returns {Object} shape of { pending, resolve, reject }, each field stands for the specific action creator
 */
export function caa(type, payload = _idOrSpread) {
  return {
    pending: ca(type, payload),
    resolve: ca(type, payload, 'resolved'),
    reject: ca(type, payload, 'rejected')
  }
}
