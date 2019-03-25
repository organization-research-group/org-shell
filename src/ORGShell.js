"use strict";

const React = require('react')
    , h = require('react-hyperscript')
    , querystring = require('querystring')
    , Route = require('./Route')
    , { NavigationContext, OrgShellConfigContext } = require('./context')

const NotFound = () => h('h1', null, 'Not Found')

function noop() {
  return null
}

module.exports = function makeORGShell({
  resources,
  extraArgs,
  onRouteChange=noop,
  NotFoundComponent=NotFound,
  processOpts={
    serializeValue: encodeURIComponent,
    deserializeValue: decodeURIComponent,
  },
}, Component) {
  class ORGShell extends React.Component {
    constructor() {
      super();

      this.state = {
        loading: true,

        activeResource: null,
        activeParams: null,
        activeOpts: null,
      }

      this.updateCurrentOpts = this.updateCurrentOpts.bind(this);
      this.navigateTo = this.navigateTo.bind(this);

    }

    navigateTo(route, pushState) {
      this.setApplicationRoute(route, pushState)
    }

    componentDidMount() {
      const loadCurrentWindowPath = () => {
        const path = window.location.search + window.location.hash

        this.navigateTo(
          Route._fromPath(path, processOpts.serializeValue),
          false
        )
      }

      window.onpopstate = loadCurrentWindowPath

      loadCurrentWindowPath();
    }

    async setApplicationRoute(route, pushState=true) {
      if (typeof route === 'string') route = Route._fromPath(route, processOpts.deserializeValue)

      let redirectTo

      const { resourceName, params, opts } = route
          , path = route._asURL()
          , redirect = url => redirectTo = url

      const resource = resources[resourceName] || { Component: NotFoundComponent }

      this.setState({
        loading: true
      })

      if (pushState) {
        window.history.pushState(undefined, undefined, path);
      } else {
        window.history.replaceState(undefined, undefined, path);
      }

      try {
        if (resource.onBeforeRoute) {
          await resource.onBeforeRoute(
            params,
            redirect,
            extraArgs,
          )
        }

        if (redirectTo) {
          this.setApplicationRoute(redirectTo, false);
        } else {
          this.setState({
            activeResource: resource,
            activeParams: params,
            activeOpts: opts,
          }, () => {
            onRouteChange(route, extraArgs)
          })
        }

      } catch (err) {
          this.setState({
            activeResource: {
              Component: () => h('div', null, [
                h('h1', null, `Error while loading resource \`${resourceName}\``),
                h('pre', null, err.stack || err),
              ])
            },
            activeParams: null,
            activeOpts: null,
          })

      } finally {
        this.setState({ loading: false })
      }
    }

    updateCurrentOpts(fn) {
      const { activeOpts } = this.state
          , nextOpts = fn(activeOpts) || {}
          , serialized = {}

      Object.entries(nextOpts).forEach(([k, v]) => {
        serialized[k] = processOpts.serializeValue(v)
      })

      this.setState(
        { activeOpts: nextOpts },
        () => {
          const nextHash = querystring.stringify(serialized)

          let nextPath = window.location.pathname + window.location.search

          if (nextHash) nextPath += `#${nextHash}`

          window.history.replaceState(undefined, undefined, nextPath);
        }
      )
    }

    render() {
      const {
        loading,
        activeResource,
        activeParams,
        activeOpts,
      } = this.state

      const innerOpts = {
        resource: activeResource,
        params: activeParams,
        opts: activeOpts,
        updateOpts: this.updateCurrentOpts,
      }

      const outerOpts = Object.assign({}, innerOpts, {
        loading,
        activeResource,
      })

      return (
        h(OrgShellConfigContext.Provider, {
          value: processOpts
        }, h(NavigationContext.Provider, {
            value: this.navigateTo,
          }, h(Component, outerOpts,
            activeResource && h(activeResource.Component, innerOpts)
          ))
        )
      )
    }
  }

  return ORGShell
}
