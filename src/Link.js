"use strict";

const React = require('react')
    , h = React.createElement
    , PropTypes = require('prop-types')
    , Route = require('./Route')
    , Navigable = require('./Navigable')
    , { OrgShellConfigContext } = require('./context')

module.exports = function makeInternalLink(Component) {
  const ORGShellLink = props => {
    const isInternalLink = props.hasOwnProperty('route')

    const {
      navigateTo,
      route,
      pushState,
      children,
      ...childProps
    } = props

    if (!isInternalLink) return h(Component, childProps)

    return (
      h(OrgShellConfigContext.Consumer, {}, ({ serializeValue }) =>
        h(Component, Object.assign({}, childProps, {
          href: route._asURL(serializeValue),
          onClick: e => {
            if (e.ctrlKey || e.shiftKey) return;

            e.preventDefault();

            navigateTo(route, pushState)
          }
        }), children)
      )
    )
  }

  ORGShellLink.propTypes = {
    route: PropTypes.instanceOf(Route),
    pushState: PropTypes.bool,
  }

  return Navigable(ORGShellLink);
}
