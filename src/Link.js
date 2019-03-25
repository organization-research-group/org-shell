"use strict";

const React = require('react')
    , h = React.createElement
    , R = require('ramda')
    , PropTypes = require('prop-types')
    , Route = require('./Route')
    , Navigable = require('./Navigable')
    , { OrgShellConfigContext } = require('./context')

module.exports = function makeInternalLink(Component) {
  const ORGShellLink = props => {
    const isInternalLink = props.hasOwnProperty('route')
        , childProps = R.omit(['navigateTo', 'route', 'pushState'], props)

    if (!isInternalLink) return h(Component, childProps)

    return (
      h(OrgShellConfigContext.Consumer, {}, ({ serializeValue }) =>
        h(Component, Object.assign({}, childProps, {
          href: props.route._asURL(serializeValue),
          onClick: e => {
            const { route, pushState, navigateTo } = props

            if (e.ctrlKey || e.shiftKey) return;

            e.preventDefault();

            navigateTo({ route, pushState })
          }
        }), props.children)
      )
    )
  }

  ORGShellLink.propTypes = {
    route: PropTypes.instanceOf(Route),
    pushState: PropTypes.bool,
  }

  return Navigable(ORGShellLink);
}
