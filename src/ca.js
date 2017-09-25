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

const _id = id => id
export const spread = (...args) => args
/**
 * Create action creator.
 *
 * @param {String} type action type
 * @param {Function} [payload=_id] payload creator
 * @param {String} status optional status for async action
 * @returns {Function} action creator
 */
export function ca(type, payload = _id, status) {
  return (...args) => _ca(type, payload(...args), status)
}

/**
 * Create async action creator.
 *
 * @param {String} type action type
 * @param {Function} [payload=_id] payload creator
 * @returns {Object} shape of { pending, resolve, reject }, each field stands for the specific action creator
 */
export function caa(type, payload = _id) {
  return {
    pending: ca(type, payload),
    resolve: ca(type, payload, 'resolved'),
    reject: ca(type, payload, 'rejected')
  }
}
