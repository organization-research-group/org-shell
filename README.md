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

  * `onBeforeRoute`: A function that will be executed (and `await`ed) before the route switches to the resource. This function will receive three arguments:

    - `params`: The static parameters passed to this resource

    - `redirectTo`: A function that, when called, will redirect to a new route

    - `extra`: The extra arguments passed to ORGShell initially

# Route(resourceName, params, options)

A simple constructor to refer to a route within the application, along with (optionally) some static parameters, such as an item ID or similar.

Only meant to be used as an argument to components wrapped with `Link`.


# Link(Component)

A higher-order component to internally link between pages. Will provide an href property based on a route, and an onClick handler that intercepts clicks and calls pushState to change to a new resource. Takes one required prop, `route`, which must be an instance of `Route`.

# Hooks

Several hooks are available to interact with your application.

## useResource()

Provides information about the resource currently active in your application.

```
const { loading, resource, params, path } = useResource()
```

    - `loading`: A boolean value indicating whether a resource's `onBeforeRoute` method has completed

    - `resource`: The definition of the resource defined when you initiated your application

    - `params`: A key-value object of the query parameters present in the URL

    - `path`: The path currently loaded in your application, without the resource options appearing in the hash

## useOptions()

Provides the options currently passed to your active resource, as well as a function to update them. Unlike static parameters, changing the options will not cause the application to load a new resource.

```
const [ opts, updateOpts ] = useOptions()
```

    - `opts`: A key-value object of dynamic options passed to the active resource. These options are persisted in the hash fragment of the URL. Each key-value pair is joined in the same way as multiple query parameters (e.g. `k1=v1&k2=v2&k3=v3`), and the values of those pairs are run through the `deserializeValue` function passed when initializing your application. This allows, for instance, persisting JSON values as options in the URL.

    - `updateOpts(fn)`: A function to update the options passed to this resource. The function will be passed the current options and must return a key-value object representing the new options. These new options will be persisted in the URL after each value has been run through the `serializeValue` function provided when creating the application.


## useNavigation()

Provides a function to navigate the application to another resource.

```
const navigateTo = useNavigation()
```

    - `navigateTo(route, pushState?)`: Make your application navigate to another internal resource. The first argument must be a `Route` object (see above). The second argument is a boolean value indicating how the browser will handle the navigation. If this argument is `true`, the new page will be inserted into the history using the browser's [`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) function. If the argument is omitted or passed `false`, the browser will instead use [`history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState).
