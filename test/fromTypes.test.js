import fromTypes from '../src/fromTypes.js'

test('it should generate action creator using `ca` from types', () => {
  const types = {
    FOO: 'FOO',
    BAR: 'BAR'
  }

  const camap = fromTypes(types)
  expect(camap.FOO).toBeInstanceOf(Function)
  expect(camap.FOO().type).toBe('FOO')
  expect(camap.BAR).toBeInstanceOf(Function)
  expect(camap.BAR().type).toBe('BAR')
})

test('it should call transformer if defined to get function names when generating action creators', () => {
  const types = {
    DBM_FOO_BAR: 'DBM_FOO_BAR',
    DBM_FOOB_BARZ: 'DBM_FOOB_BARZ',
    FOOB_BARZ: 'FOOB_BARZ',
  }

  const transformedTypes = {
    foobar: 'DBM_FOO_BAR',
    foobbarz: 'DBM_FOOB_BARZ'
  }
  const transformer = jest.fn(() => transformedTypes)

  const camap = fromTypes(types, transformer)
  expect(transformer).toBeCalledWith(types)
  expect(camap.foobar).toBeInstanceOf(Function)
  expect(camap.foobbarz).toBeInstanceOf(Function)
})
