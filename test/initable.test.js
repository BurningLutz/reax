import React from 'react'
import TU from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import Initable from '../src/Initable'

function Foo() {
  return <div>foo</div>
}

function createDummyStore(preload) {
  return createStore(x => x, preload)
}

const wrapper = Initable({
  loadFn: () => ({ type: 'LOAD' }),
  loadingFn: (state) => state.loading,
  resetFn: () => ({ type: 'RESET' })
})
const Wrapped = wrapper(Foo)
test('it should render null when loading', () => {
  const store = createDummyStore({ loading: true })

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
  const store = createDummyStore({ loading: false })

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

test('it should call loadFn with state and props as args when mounted', () => {
  const store = createDummyStore()
  const loadFn = jest.fn(() => ({ type: 'LOAD' }))
  const wrapper1 = Initable({
    loadFn,
    loadingFn: () => true,
    resetFn: () => ({ type: 'RESET' })
  })
  const Wrapped1 = wrapper1(Foo)

  const props = { id: 1 }

  TU.renderIntoDocument(
    <Provider store={store}>
      <Wrapped1 {...props} />
    </Provider>
  )

  expect(loadFn).toBeCalledWith(store.getState(), props)
})

test('it should call loadingFn with state and props as args when rendered', () => {
  const store = createDummyStore()
  const loadingFn = jest.fn()
  const wrapper1 = Initable({
    loadFn: () => ({ type: 'LOAD' }),
    loadingFn,
    resetFn: () => ({ type: 'RESET' })
  })
  const Wrapped1 = wrapper1(Foo)

  const props = { id: 1 }

  TU.renderIntoDocument(
    <Provider store={store}>
      <Wrapped1 {...props} />
    </Provider>
  )

  expect(loadingFn).toBeCalledWith(store.getState(), props)
})

test('it should call resetFn with state and props as args when unmount', () => {
  const store = createDummyStore()
  const resetFn = jest.fn(() => ({ type: 'RESET' }))
  const wrapper1 = Initable({
    loadFn: () => ({ type: 'LOAD' }),
    loadingFn: () => true,
    resetFn,
  })
  const Wrapped1 = wrapper1(Foo)

  const props = { id: 1 }

  let wrappedRef

  TU.renderIntoDocument(
    <Provider store={store}>
      <Wrapped1 ref={(ref) => wrappedRef = ref} {...props} />
    </Provider>
  )
  wrappedRef.componentWillUnmount()

  expect(resetFn).toBeCalledWith(store.getState(), props)
})
