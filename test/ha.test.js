import ha from '../src/ha'

test('ha should call reducer fn when type matches', () => {
  const type = 'FOO'
  const reducer = ha(type, (state, action) => state + action.payload)
  const action0 = { type, payload: 1 }
  const action1 = { type: 'BAR' }

  expect(reducer(1, action0)).toBe(2)
  expect(reducer(1, action1)).toBe(1)
})

test('ha should call reducer in fn map when status matches', () => {
  const type = 'FOO'
  const reducer = ha(type, {
    pending: (state, action) => state + action.payload,
    resolve: (state, action) => state - action.payload,
    reject: (state, action) => state * action.payload,
  })
  const action0 = { type, payload: 1 }
  const action1 = { type, payload: 2, status: 'resolved' }
  const action2 = { type, payload: 3, status: 'rejected' }

  expect(reducer(1, action0)).toBe(2)
  expect(reducer(1, action1)).toBe(-1)
  expect(reducer(3, action2)).toBe(9)
  expect(() => reducer(1, { type, status: 'illegal' })).toThrow('No correct reducer provided.')
})

test('reducer should return default value when init state not provided', () => {
  const type = 'FOO'
  const reducer = ha(type, x=>x, 10)

  expect(reducer(undefined, {})).toBe(10)
})

test('ha should call reducer fn of a map', () => {
  const reducer = ha({
    MINUS: (state, action) => state - action.payload,
    MULTIPLY: (state, action) => state * action.payload,
  })
  const action0 = { type: 'MINUS', payload: 5 }
  const action1 = { type: 'MULTIPLY', payload: 10 }
  const action2 = { type: 'DIVIDE', payload: 3 }

  expect(reducer(1, action0)).toBe(-4)
  expect(reducer(2, action1)).toBe(20)
  expect(reducer(9, action2)).toBe(9)
})

test('ha should return default value when no state provided', () => {
  const reducer0 = ha()
  const reducer1 = ha('FOO', undefined, 100)

  expect(reducer0(undefined, {})).toEqual({})
  expect(reducer1(undefined, {})).toEqual(100)
})
