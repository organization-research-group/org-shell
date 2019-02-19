
"use strict";

const React = require('react')
    , h = require('react-hyperscript')
    , PropTypes = require('prop-types')
    , querystring = require('querystring')
    , Route = require('./Route')
    , NavigationContext = require('./context')

const NotFound = () => h('h1', null, 'Not Found')

function makeTitledComponent(baseTitle, makeTitle) {
  return Component =>  (
    class TitledComponent extends React.Component {
      componentDidMount() {
        let title = '';

        if (baseTitle) title += baseTitle;

        if (makeTitle) {
          const resourceTitle = makeTitle(this.props);
          if (title) title += ' | ';
          title += resourceTitle;
        }

        if (title) document.title = title;
      }

      render() {
        return h(Component, this.props)
      }
    }
  )
}

function noop() {
  return null
}

module.exports = function makeORGShell({
  resources,
  extraArgs,
  onRouteChange=noop,
  NotFoundComponent=NotFound,
  baseTitle='',
}, Component) {
  const loadedResources = {}

  Object.entries(resources).forEach(([ key, resource ]) => {
    loadedResources[key] = Object.assign({}, resource, {
      Component: makeTitledComponent(baseTitle, resource.makeTitle)(resource.Component)
    })
  })

  class ORGShell extends React.Component {
    constructor() {
      super();

      this.state = {
        loading: true,

        activeResource: null,
        activeParams: null,
        activeOpts: null,
        activeExtra: null,
      }

      this.updateCurrentOpts = this.updateCurrentOpts.bind(this);
      this.navigateTo = this.navigateTo.bind(this);

    }

    navigateTo(route, pushState) {
      this.setApplicationRoute(route, pushState)
    }

    getChildContext() {
      return {
        navigateTo: this.navigateTo,
      }
    }

    componentDidMount() {
      const loadCurrentWindowPath = pushState => {
        this.navigateTo(
          Route.fromPath(window.location.search + window.location.hash),
          pushState,
        )
      }

      window.onpopstate = loadCurrentWindowPath.bind(null, false);

      loadCurrentWindowPath(true);
    }

    async setApplicationRoute(route, pushState=true) {
      if (typeof route === 'string') route = Route.fromPath(route)

      let redirectTo

      const { resourceName, params, opts } = route
          , path = route.asURL()
          , redirect = url => redirectTo = url

      const resource = loadedResources[resourceName] || { Component: NotFoundComponent }

      this.setState({
        loading: true
      })

      try {
        let extraProps = {}

        if (resource.onBeforeRoute) {
          extraProps = await resource.onBeforeRoute(
            params,
            redirect,
            extraArgs,
          )
        }

        if (redirectTo) {
          this.setApplicationRoute(redirectTo);
        } else {
          await onRouteChange(route, extraArgs)

          this.setState({
            activeResource: resource,
            activeParams: params,
            activeOpts: opts,
            activeExtra: extraProps,
          })

          if (pushState) {
            window.history.pushState(undefined, undefined, path);
          }
        }
      } catch (err) {
          if (pushState) {
            window.history.pushState(undefined, undefined, path);
          }

          this.setState({
            activeResource: {
              Component: () => h('div', null, [
                h('h1', null, `Error while loading resource \`${resourceName}\``),
                h('pre', null, err.stack || err),
              ])
            },
            activeParams: null,
            activeOpts: null,
            activeExtra: null,
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
        serialized[k] = JSON.stringify(v)
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
        activeExtra,
      } = this.state

      const innerOpts = {
        params: activeParams,
        opts: activeOpts,
        extra: activeExtra,
        updateOpts: this.updateCurrentOpts,
      }

      const outerOpts = Object.assign({}, innerOpts, {
        loading,
        activeResource,
      })

      return (
        h(NavigationContext.Provider, {
          value: this.navigateTo,
        }, h(Component, outerOpts,
          activeResource && h(activeResource.Component, innerOpts)
        ))
      )
    }
  }

  ORGShell.childContextTypes = {
    navigateTo: PropTypes.func,
  }

  return ORGShell
}
