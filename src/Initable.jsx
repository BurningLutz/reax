import PropTypes from 'prop-types'
import { PureComponent, createElement } from 'react'
import hoistStatics from 'hoist-non-react-statics'

import getDisplayName from './getDisplayName'

function Initable({ loadFn, loadingFn, resetFn }) {
  return function (WrappedComponent) {
    const connectDisplayName = `Initable(${getDisplayName(WrappedComponent)})`
    class Initable extends PureComponent {
      componentDidMount() {
        const store = this.context.store
        store.dispatch(loadFn())
        this.subscriber = store.subscribe(this.onChangeState)
      }
      componentWillUnmount() {
        resetFn && this.context.store.dispatch(resetFn())
        this.subscriber()
      }

      onChangeState = () => {
        this.setState({}) // NOTE: Only for triggering update
      }

      render() {
        return !loadingFn(this.context.store.getState(), this.props) && createElement(WrappedComponent, this.props)
      }
    }

    Initable.displayName = connectDisplayName
    Initable.WrappedComponent = WrappedComponent
    Initable.contextTypes = {
      store: PropTypes.any.isRequired,
    }

    return hoistStatics(Initable, WrappedComponent)
  }
}

export default Initable
