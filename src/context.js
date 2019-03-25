"use strict";

const React = require('react')

const NavigationContext = React.createContext(null)
    , OrgShellConfigContext = React.createContext(null)

module.exports = {
  NavigationContext,
  OrgShellConfigContext,
}
