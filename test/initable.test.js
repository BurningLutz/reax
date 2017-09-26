import React from 'react'
import TU from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

import Initable from '../src/Initable'

function Foo() {
  return <div>foo</div>
}

const LOADED = 'LOADED'
const LOAD = 'LOAD'
const RESET = 'RESET'
function createTestStore() {
  return createStore(
    (s = { loading: true }, action) => {
      switch(action.type) {
      case LOADED:
        return { ...s, loading: false }
      case LOAD:
        return { ...s, value: 10 }
      case RESET:
        return { ...s, value: null }
      default:
        return s
      }
    },
    applyMiddleware(
      thunkMiddleware
    )
  )
}
const wrapper = Initable({
  loadFn: () => ({ type: LOAD }),
  loadingFn: (state) => state.loading,
  resetFn: () => ({ type: RESET })
})
const Wrapped = wrapper(Foo)

test('it should render null when loading', () => {
  const store = createTestStore()

  const tree = TU.renderIntoDocument(
    <Provider store={store}>
      <Wrapped />
    </Provider>
  )
  const testee = TU.findRenderedComponentWithType(
    tree,
    Wrapped
  )

  expect(testee.render()).toBeFalsy()
})

test('it should render component when not loading', () => {
  const store = createTestStore()
  store.dispatch({ type: LOADED })

  const tree = TU.renderIntoDocument(
    <Provider store={store}>
      <Wrapped />
    </Provider>
  )
  const testee = TU.findRenderedComponentWithType(
    tree,
    Wrapped
  )

  expect(TU.isElementOfType(testee.render(), Foo)).toBeTruthy()
})

test('it should call loadFn when mounted', () => {
  const store = createTestStore()

  TU.renderIntoDocument(
    <Provider store={store}>
      <Wrapped />
    </Provider>
  )

  expect(store.getState().value).toBe(10)
})

test('it should call resetFn when unmount', () => {
  const store = createTestStore()
  let wrappedRef

  TU.renderIntoDocument(
    <Provider store={store}>
      <Wrapped ref={(ref) => wrappedRef = ref} />
    </Provider>
  )
  wrappedRef.componentWillUnmount()

  expect(store.getState().value).toBeNull()
})
