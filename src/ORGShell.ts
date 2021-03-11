"use strict";

import * as React from 'react'
import querystring from 'querystring'

import Route from './Route'

import {
  ORGShellNavigationContext,
  ORGShellConfigContext,
  ORGShellResourceContext,
  ORGShellOptionsContext,
  UpdateOpts,
  UpdateOptsCallback,
  EmptyUpdateOptsCallback,
} from './context'

import {
  ORGShellResource,
  ORGShellConfig,
  SerializeValue,
  DeserializeValue,
  Params,
  Opts
} from './types'

const h = React.createElement

function DefaultNotFound() {
  return (
    h('h1', null, 'Not found')
  )
}

function noop() {}

function identity(x: any) {
  return x
}

interface Props {}

interface State {
  loading: boolean;
  activeResource: ORGShellResource | null;
  activeParams: Params | null;
  activeOpts: Opts<any>;
  activePath: string | null;
}

export default function makeORGShell({
  resources,
  extraArgs,
  onRouteChange=noop,
  NotFoundComponent=DefaultNotFound,
  processOpts={},
}: ORGShellConfig, Component: any): React.ComponentClass {
    const {
      serializeValue=identity,
      deserializeValue=identity
    } = processOpts

  class ORGShell extends React.Component<Props, State> {
    constructor(props: Props, state: State) {
      super(props);

      this.state = {
        loading: true,

        activeResource: null,
        activeParams: null,
        activeOpts: {},
        activePath: null,
      }

      this.updateCurrentOpts = this.updateCurrentOpts.bind(this);
      this.navigateTo = this.navigateTo.bind(this);

    }

    navigateTo(route: Route, pushState?: boolean) {
      this.setApplicationRoute(route, pushState)
    }

    componentDidMount() {
      const loadCurrentWindowPath = () => {
        const path = window.location.search + window.location.hash

        this.navigateTo(
          Route._fromPath(path, deserializeValue),
          false
        )
      }

      window.onpopstate = loadCurrentWindowPath

      loadCurrentWindowPath();
    }

    async setApplicationRoute(route: Route, pushState=true) {
      if (typeof route === 'string') route = Route._fromPath(route, deserializeValue)

      let redirectTo: Route | null = null

      const { resourceName, params, opts } = route
          , path = route._asURL(serializeValue)
          , redirect = (route: Route) => redirectTo = route

      const resource = resources[resourceName] || { Component: NotFoundComponent }

      this.setState({
        loading: true
      })

      if (pushState) {
        window.history.pushState(undefined, document.title, path);
      } else {
        window.history.replaceState(undefined, document.title, path);
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
          route;
          this.setState({
            activeResource: resource,
            activeParams: params,
            activeOpts: opts,
            activePath: new Route(resource.name, params)._asURL(serializeValue),
          }, () => {
            route
            onRouteChange(route, resource, extraArgs)
          })
        }

      } catch (err) {
          this.setState({
            activeResource: {
              name: '__not-found',
              Component: () => h('div', null, [
                h('h1', null, `Error while loading resource \`${resourceName}\``),
                h('pre', null, err.stack || err),
              ])
            },
            activeParams: null,
            activeOpts: {},
          })

      } finally {
        this.setState({ loading: false })
      }
    }

    // FIXME: These type constraints should live elsewhere
    updateCurrentOpts<P extends object>(update: UpdateOptsCallback<Partial<P>> | EmptyUpdateOptsCallback<P>) {
      const { activeOpts } = this.state
          , serialized: Record<string, any> = {}

      let nextOpts = update(activeOpts)

      if (nextOpts == undefined) {
        nextOpts = {}
      }

      Object.entries(nextOpts).forEach(([k, v]) => {
        serialized[k] = serializeValue(v)
      })

      this.setState(
        { activeOpts: nextOpts },
        () => {
          const nextHash = querystring.stringify(serialized)

          let nextPath = window.location.pathname + window.location.search

          if (nextHash) nextPath += `#${nextHash}`

          window.history.replaceState(undefined, document.title, nextPath);
        }
      )
    }

    render() {
      const {
        loading,
        activeResource,
        activeParams,
        activeOpts,
        activePath,
      } = this.state

      return (
        h(ORGShellConfigContext.Provider, {
          value: {
            serializeValue,
            deserializeValue,
          },
        },
          h(ORGShellNavigationContext.Provider, {
            value: {
              navigateTo: this.navigateTo,
            },
          },
            h(ORGShellResourceContext.Provider, {
              value: {
                loading,
                resource: activeResource,
                params: activeParams,
                path: activePath,
              },
            },
              h(ORGShellOptionsContext.Provider, {
                value: {
                  opts: activeOpts,
                  updateOpts: this.updateCurrentOpts,
                },
              },
                h(Component, null,
                  activeResource && h(activeResource.Component, {
                    key: activePath,
                  })
                )
              )
            )
          )
        )
      )
    }
  }

  return ORGShell
}
