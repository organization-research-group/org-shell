"use strict";

import * as React from 'react'
import * as PropTypes from 'prop-types'
import Route from './Route'
import { useNavigation } from './Navigable'
import { OrgShellConfigContext, ORGShellConfigProps, NavigationProps } from './context'

const h = React.createElement
    , { useContext } = React

interface ORGShellLinkProps {
  route?: Route;
  pushState?: boolean;
}

interface ORGShellLinkExtra {
  href: string;
  onClick: (evt: React.MouseEvent) => void;
}

export default function Link<P extends ORGShellLinkExtra>(
  Component: React.ComponentType<P>
) {
  function ORGShellLink(props: P & ORGShellLinkProps) {
    const { serializeValue } = useContext(OrgShellConfigContext)!
        , navigateTo = useNavigation()
        , { route, pushState, ...childProps } = props

    // If route isn't present, this is an internal link
    if (route == undefined) {
      return h(Component, childProps as P)
    }

    const newProps = {
      ...childProps,
      href: route._asURL(serializeValue),
      onClick: (e: React.MouseEvent) => {
        if (e.ctrlKey || e.shiftKey) return;

        e.preventDefault();

        navigateTo(route, pushState)
      },
    }

    return h(Component, newProps as P)
  }

  return ORGShellLink
}
