import PropTypes from 'prop-types'
import { PureComponent, createElement } from 'react'
import hoistStatics from 'hoist-non-react-statics'

import getDisplayName from './getDisplayName'

/**
 * An HOC to create auto-load components with essential hooks.
 *
 * @param {Object} hooks The hooks to trigger at different situation.
 * There are 4 hooks named:
 * - loadFn, the load function to call when component did mount.
 * - loadingFn, the loading function to call to determine whether datas
 *              are still loading when rendered.
 * - unloadFn?, the upload function to call if provided when component will unmount.
 * - reloadFn?, the reload function to call if provided when component will receive new props.
 * @returns {Component} Initable component
 */
function Initable({ loadFn, loadingFn, unloadFn, reloadFn }) {
  return function (WrappedComponent) {
    const connectDisplayName = `Initable(${getDisplayName(WrappedComponent)})`
    class Initable extends PureComponent {
      _store = this.context.store

      componentDidMount() {
        this._store.dispatch(loadFn(this._store.getState(), this.props))
        this.subscriber = this._store.subscribe(this.onChangeState)
      }
      componentWillUnmount() {
        unloadFn && this._store.dispatch(unloadFn(this._store.getState(), this.props))
        this.subscriber()
      }
      componentWillReceiveProps(props) {
        if (reloadFn) {
          this._store.dispatch(reloadFn(this._store.getState(), this.props, props))
        } else {
          unloadFn && this._store.dispatch(unloadFn(this._store.getState(), this.props))
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
