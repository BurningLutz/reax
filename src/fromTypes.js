import { ca } from './ca.js'

function fromTypes(types, transformer) {
  if (transformer) {
    types = transformer(types)
  }

  return Object.keys(types).reduce((ret, type) => {
    ret[type] = ca(types[type])
    return ret
  }, {})
}

export default fromTypes
