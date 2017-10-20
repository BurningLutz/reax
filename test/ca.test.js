import { ca, caa, spread } from '../src/ca'

test('action creator with specific type and a single param', () => {
  const type    = 'FOO'
  const creator = ca(type)
  let action

  action = creator()
  expect(action).toEqual({ type })

  action = creator(1)
  expect(action).toEqual({ type, payload: 1 })
})

test('action creator with specific type and many params', () => {
  const type    = 'FOO'
  const creator = ca(type)
  const action  = creator(1, 2, 3)

  expect(action).toEqual({ type, payload: [1, 2, 3] })
})

test('action creator with specific type and payload creator', () => {
  const type    = 'FOO'
  const creator = ca(type, spread)
  const action  = creator(1, 2, 3)

  expect(action).toEqual({ type, payload: [1, 2, 3] })
})

test('action creator with specific type and status', () => {
  const type    = 'FOO'
  const creator = ca(type, x=>x, 'bar')
  let action

  action = creator(1)
  expect(action).toEqual({ type, payload: 1, status: 'bar' })
})

test('async action creator with specific type', () => {
  const type    = 'FOO'
  const creator = caa(type)

  expect(creator.pending(1)).toEqual({ type, payload: 1 })
  expect(creator.resolve(1)).toEqual({ type, payload: 1, status: 'resolved' })
  expect(creator.reject(1)).toEqual({ type, payload: 1, status: 'rejected' })
})
