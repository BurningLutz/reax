import I from 'Immutable'

import keyedReducer from '../src/keyedReducer'

test('set value at key', () => {
  const s = I.Map()
  const a = { payload: 1 }
  expect(keyedReducer('val')(s, a).toJS().val).toBe(1)
})
