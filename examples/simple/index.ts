"use strict";

import ReactDOM from 'react-dom'
import * as React from 'react'

import { ORGShell, Route } from '../../src'
import { ORGShellResource } from '../../src/types'

const h = React.createElement

const resources: Record<string, ORGShellResource> = {
  '': {
    name: '',
    Component: null,
    onBeforeRoute: (params, redirectTo) => {
      redirectTo(new Route('home'))
    },
  },

  'home': {
    name: 'home',
    Component: Home,
  },
}

function Home(props) {
  return (
    h('div', null, [
      h('p', null, 'Home page'),
      h('input', {
      })
    ])
  )
}

function Application(props: React.PropsWithChildren<{}>) {
  return (
    h('main', null, props.children)
  )
}

const WrappedApplication = ORGShell({
  resources
}, Application)

ReactDOM.render(
  h(WrappedApplication),
  document.getElementById('main'))
