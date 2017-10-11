import PropTypes from 'prop-types'
import { PureComponent, createElement } from 'react'
import hoistStatics from 'hoist-non-react-statics'

import getDisplayName from './getDisplayName'

function Initable({ loadFn, loadingFn, resetFn, reloadFn }) {
  return function (WrappedComponent) {
    const connectDisplayName = `Initable(${getDisplayName(WrappedComponent)})`
    class Initable extends PureComponent {
      _store = this.context.store

      componentDidMount() {
        this._store.dispatch(loadFn(this._store.getState(), this.props))
        this.subscriber = this._store.subscribe(this.onChangeState)
      }
      componentWillUnmount() {
        resetFn && this._store.dispatch(resetFn(this._store.getState(), this.props))
        this.subscriber()
      }
      componentWillReceiveProps(props) {
        if (reloadFn) {
          this._store.dispatch(reloadFn(this._store.getState(), this.props, props))
        } else {
          this._store.dispatch(resetFn(this._store.getState(), this.props))
          this._store.dispatch(loadFn(this._store.getState(), props))
        }
      }

      onChangeState = () => {
        this.setState({}) // NOTE: Only for triggering update
      }

      render() {
        return !loadingFn(this._store.getState(), this.props) && createElement(WrappedComponent, this.props)
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
