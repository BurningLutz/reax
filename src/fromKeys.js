function fromKeys(keys) {
  return keys.reduce((ret, k) => {
    ret[k] = k
    return ret
  }, {})
}

export default fromKeys
