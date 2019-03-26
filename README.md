# Org-Shell

A shell for applications.

  * Routing using named query parameters

  * Serialization of resource state via updatable query parameters

  * Well-defined resource definitions, including loading data on/before page
    load

# API

```js
const h = require('react-hyperscript')
    , { ORGShell, Link, Route } = require('org-shell')
    , createStore = require('./store')

const resources = {
  '': {
    Component: () => (
      h('div', [
        h(Link('a'), {
          route: new Route('hello', { name: 'Patrick }),
        }, 'Home')
      ])
    )
  },

  'hello': {
    Component: (props) => (
      h('p', `Hello, ${props.params.name}`)
    )
  }
}

const ApplicationContainer = props =>
  h('div', [
    h('header', 'Header'),
    h('main', {}, props.children),
    h('footer', 'Footer'),
  ])

const Application = ORGShell({
  resources
}, ApplicationContainer)

ReactDOM.render(Application)
```

# ORGShell(opts, Component)

The main piece of this library is the higher-order component ORGShell. It takes several options, two of which are required.

  * `resources` (required): A map of resources (see below)

  * `NotFoundComponent`: A component to be rendered when a resource is not found

  * `processOpts: { serializeValue, deserializeValue }`: Functions to serialize and deserialize values when translating to/from the page's address

  * `extraArgs`: A value that should be passed to resources' `onBeforeRoute` function

## Definining resources

Resources are plain objects. The following keys are significant:

  * `Component` (required): The React component that will be rendered for this resource. Several props are provided when this component is rendered:

    - `params`: An object of the static parameters passed to this resource

    - `opts`: An object of the dynamic options passed to this resources

    - `updateOpts`: A function (to be called with a function) to update the resource's current options. For example:

        ```js
        updateOpts(prevOpts => Object.assign({}, prevOpts, { value: 4 }))
        ```
    - `resource`: The object representing the resource

  * `onBeforeRoute`: A function that will be executed (and `await`ed) before the route switches to the resource. This function will receive three arguments:

    - `params`: The static parameters passed to this resource

    - `redirectTo`: A function that, when called, will redirect to a new route

    - `extra`: The extra arguments passed to ORGShell initially

# Route(resourceName, params, options)

A simple constructor to refer to a route within the application, along with (optionally) some static parameters, such as an item ID or similar.

Only meant to be used as an argument to components wrapped with `Link`.

# Link(Component)

A higher-order component to internally link between pages. Will provide an href property based on a route, and an onClick handler that intercepts clicks and calls pushState to change to a new resource. Takes one required prop, `route`, which must be an instance of `Route`.
