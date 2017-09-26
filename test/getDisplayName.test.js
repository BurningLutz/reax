import React, { PureComponent } from 'react'

import getDisplayName from '../src/getDisplayName'

test('it should return correct displayName' ,() => {
  function Foo() {
    return <div>foo</div>
  }
  class Bar extends PureComponent {
    render() {
      return <div>bar</div>
    }
  }
  function FooBar() {
    return <div>foobar</div>
  }
  delete FooBar.name

  expect(getDisplayName(Foo)).toBe('Foo')
  expect(getDisplayName(Bar)).toBe('Bar')
  expect(getDisplayName(FooBar)).toBe('Component')
})
