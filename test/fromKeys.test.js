import fromKeys from '../src/fromKeys'

test('it should generate a map containing kv pairs of the same value of key', () => {
  const types = [
    'foo',
    'bar',
  ]
  const typemap = {
    foo: 'foo',
    bar: 'bar'
  }

  expect(fromKeys(types)).toEqual(typemap)
})
