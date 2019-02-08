"use strict";

const React = require('react')
    , h = React.createElement
    , PropTypes = require('prop-types')

module.exports = function makeNavigable(Component) {
  class Navigable extends React.Component {
    render () {
      const { navigateTo } = this.context

      return h(Component, Object.assign({ navigateTo }, this.props))
    }
  }

  Navigable.contextTypes = {
    navigateTo: PropTypes.object,
  }

  return Navigable;
}
