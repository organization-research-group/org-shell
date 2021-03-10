"use strict";

import ReactDOM from 'react-dom'
import * as React from 'react'

import { ORGShell, Route, useOptions, ORGShellOptions } from '../../src'
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

type PageOptions = {
  counter: number | string | undefined;
}

function Home() {
  const [ opts, updateOpts ]: ORGShellOptions<PageOptions> = useOptions()

  return (
    h('div', null, [
      h('p', { key: 1 }, 'Home page'),

      h('button', {
        key: 2,
        onClick() {
          updateOpts(prev => {
            let prevCount: number

            if (typeof prev.counter === 'string') {
              prevCount = parseInt(prev.counter)
            } else {
              prevCount = prev.counter || 0
            }

            return {
              counter: prevCount + 1
            }
          })
        },
      }, 'Count: ' + (opts.counter || 0)),

      h('br', { key: 3 }),

      h('button', {
        key: 4,
        onClick() {
          updateOpts(() => null)
        }
      }, 'Reset')
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
