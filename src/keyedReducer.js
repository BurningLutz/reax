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
