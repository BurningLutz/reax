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

const dummyLoadFn = () => ({ type: 'LOAD' })
const dummyUnloadFn = () => ({ type: 'UNLOAD' })
const dummyLoadingFn = state => state && state.loading
const dummyReloadFn = () => ({ type: 'RELOAD' })

const wrapper = Initable({
  loadFn: dummyLoadFn,
  loadingFn: dummyLoadingFn,
  unloadFn: dummyUnloadFn,
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
  const loadFn = jest.fn(dummyLoadFn)
  const wrapper1 = Initable({
    loadFn,
    loadingFn: dummyLoadingFn,
    unloadFn: dummyUnloadFn
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
    loadFn: dummyLoadFn,
    loadingFn,
    unloadFn: dummyUnloadFn
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

test('it should call unloadFn if provided with state and props as args when unmount', () => {
  const store = createDummyStore()
  const unloadFn = jest.fn(dummyUnloadFn)
  const wrapper1 = Initable({
    loadFn: dummyLoadFn,
    loadingFn: dummyLoadingFn,
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

  const wrapper2 = Initable({
    loadFn: dummyLoadFn,
    loadingFn: dummyLoadingFn,
  })
  const Wrapped2 = wrapper2(Foo)

  expect(() => {
    const renderer = TR.create(
      <Provider store={store}>
        <Wrapped2 />
      </Provider>
    )
    renderer.unmount()
  }).not.toThrow()
})

test('it should call unloadFn & loadFn in order if reloadFn is not provided when received new props', () => {
  const store = createDummyStore()
  const loadFn = jest.fn(dummyLoadFn)
  const unloadFn = jest.fn(dummyUnloadFn)
  const wrapper1 = Initable({
    loadFn,
    loadingFn: dummyLoadingFn,
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

  const wrapper2 = Initable({
    loadFn: dummyLoadFn,
    loadingFn: dummyLoadingFn,
  })
  const Wrapped2 = wrapper2(Foo)
  expect(() => {
    const renderer = TR.create(
      <Provider store={store}>
        <Wrapped2 {...oldProps} />
      </Provider>
    )
    renderer.update(
      <Provider store={store}>
        <Wrapped2 {...newProps} />
      </Provider>
    )
  }).not.toThrow()
})

test('it should call reloadFn if provided when received new props, but should NOT call reloadFn when received the same props', () => {
  const store = createDummyStore()
  const reloadFn = jest.fn(dummyReloadFn)
  const loadFn = jest.fn(dummyLoadFn)
  const unloadFn = jest.fn(dummyUnloadFn)
  const wrapper1 = Initable({
    loadFn,
    loadingFn: dummyLoadingFn,
    unloadFn,
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
  expect(loadFn).toHaveBeenCalledTimes(1)

  renderer.update(
    <Provider store={store}>
      <Wrapped1 {...newProps} />
    </Provider>
  )
  // call update twice with the same props to simulate `componentWillReceiveProps`
  // with same props
  renderer.update(
    <Provider store={store}>
      <Wrapped1 {...newProps} />
    </Provider>
  )

  expect(reloadFn).toBeCalledWith(store.getState(), oldProps, newProps)
  expect(reloadFn).toHaveBeenCalledTimes(1)
  expect(loadFn).toHaveBeenCalledTimes(1)
  expect(unloadFn).not.toBeCalled()
})

test('render should be called when loadFn brings update to store', () => {
  const store = createDummyStore()
  const loadingFn = jest.fn(dummyLoadingFn)
  const wrapper1 = Initable({
    loadFn: dummyLoadFn,
    loadingFn,
    unloadFn: dummyUnloadFn,
    reloadFn: dummyReloadFn,
  })
  const Wrapped1 = wrapper1(Foo)

  TR.create(
    <Provider store={store}>
      <Wrapped1 />
    </Provider>
  )

  expect(loadingFn).toHaveBeenCalledTimes(2)
})
