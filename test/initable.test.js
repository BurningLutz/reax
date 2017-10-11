import React from 'react'
import TU from 'react-dom/test-utils'
import TR from 'react-test-renderer'
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
  unloadFn: () => ({ type: 'UNLOAD' })
})
const Wrapped = wrapper(Foo)
test('it should render null when loading', () => {
  const store = createDummyStore({ loading: true })

  const renderer = TR.create(
    <Provider store={store}>
      <Wrapped />
    </Provider>
  )
  const elem = renderer.root.findByType(Wrapped).instance

  expect(elem.render()).toBeFalsy()
})

test('it should render component when not loading', () => {
  const store = createDummyStore({ loading: false })

  const renderer = TR.create(
    <Provider store={store}>
      <Wrapped />
    </Provider>
  )
  const elem = renderer.root.findByType(Wrapped).instance

  expect(TU.isElementOfType(elem.render(), Foo)).toBeTruthy()
})

test('it should call loadFn with state and props as args when mounted', () => {
  const store = createDummyStore()
  const loadFn = jest.fn(() => ({ type: 'LOAD' }))
  const wrapper1 = Initable({
    loadFn,
    loadingFn: () => true,
    unloadFn: () => ({ type: 'UNLOAD' })
  })
  const Wrapped1 = wrapper1(Foo)

  const props = { id: 1 }

  TR.create(
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
    unloadFn: () => ({ type: 'UNLOAD' })
  })
  const Wrapped1 = wrapper1(Foo)

  const props = { id: 1 }

  TR.create(
    <Provider store={store}>
      <Wrapped1 {...props} />
    </Provider>
  )

  expect(loadingFn).toBeCalledWith(store.getState(), props)
})

test('it should call unloadFn with state and props as args when unmount', () => {
  const store = createDummyStore()
  const unloadFn = jest.fn(() => ({ type: 'UNLOAD' }))
  const wrapper1 = Initable({
    loadFn: () => ({ type: 'LOAD' }),
    loadingFn: () => true,
    unloadFn,
  })
  const Wrapped1 = wrapper1(Foo)

  const props = { id: 1 }

  const renderer = TR.create(
    <Provider store={store}>
      <Wrapped1 {...props} />
    </Provider>
  )
  renderer.unmount()

  expect(unloadFn).toBeCalledWith(store.getState(), props)
})

test('it should call unloadFn & loadFn in order if reloadFn is not provided when received new props', () => {
  const store = createDummyStore()
  const loadFn = jest.fn(() => ({ type: 'LOAD' }))
  const unloadFn = jest.fn(() => ({ type: 'UNLOAD' }))
  const wrapper1 = Initable({
    loadFn,
    loadingFn: () => false,
    unloadFn,
  })
  const Wrapped1 = wrapper1(Foo)

  const oldProps = { id: 1 }
  const newProps = { id: 2 }

  const renderer = TR.create(
    <Provider store={store}>
      <Wrapped1 {...oldProps} />
    </Provider>
  )
  renderer.update(
    <Provider store={store}>
      <Wrapped1 {...newProps} />
    </Provider>
  )

  expect(unloadFn).toBeCalledWith(store.getState(), oldProps)
  expect(loadFn).toBeCalledWith(store.getState(), newProps)
})

test('it should call reloadFn if provided when received new props', () => {
  const store = createDummyStore()
  const reloadFn = jest.fn(() => ({ type: 'RELOAD' }))
  const wrapper1 = Initable({
    loadFn: () => ({ type: 'LOAD' }),
    loadingFn: () => false,
    unloadFn: () => ({ type: 'UNLOAD' }),
    reloadFn,
  })
  const Wrapped1 = wrapper1(Foo)

  const oldProps = { id: 1 }
  const newProps = { id: 2 }

  const renderer = TR.create(
    <Provider store={store}>
      <Wrapped1 {...oldProps} />
    </Provider>
  )
  renderer.update(
    <Provider store={store}>
      <Wrapped1 {...newProps} />
    </Provider>
  )

  expect(reloadFn).toBeCalledWith(store.getState(), oldProps, newProps)
})
