"use strict";

const React = require('react')
    , h = React.createElement
    , NavigationContext = require('./context')

module.exports = function makeNavigable(Component) {
  class Navigable extends React.Component {
    render () {
      return (
        h(NavigationContext.Consumer, {}, navigateTo =>
          h(Component, Object.assign(this.props, { navigateTo }))
        )
      )
    }
  }

  return Navigable;
}
