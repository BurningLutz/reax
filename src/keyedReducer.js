/**
 * Generate a reducer to set value at key or keypath
 *
 * @param {String|Array<String>|Function} keyOrKeypathOrGetter A key or keypath to set value at.
 * If it is a function, it will be called with (state, action), and it should return key or keypath
 * @param {Function} [transform=x=>x] transformer to get transformed value to set
 * @returns {Function} the reducer
 */
export default function keyedReducer(keyOrKeypathOrGetter, transform = x => x) {
  return (state, action) => {
    let keyarg = keyOrKeypathOrGetter
    if (keyOrKeypathOrGetter instanceof Function) {
      keyarg = keyOrKeypathOrGetter(state, action)
    }
    const transformedValue = transform(action.payload)
    if (keyarg instanceof Array) {
      return state.setIn(keyarg, transformedValue)
    } else {
      return state.set(keyarg, transformedValue)
    }
  }
}
