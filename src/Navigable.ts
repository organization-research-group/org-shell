"use strict";

import * as React from 'react'

import { NavigationContext, NavigationProps } from './context'

const { useContext } = React
    , h = React.createElement

export function useNavigation() {
  const { navigateTo } = useContext(NavigationContext)!

  return navigateTo

}

export function Navigable<P>(
  Component: React.ComponentType<P & NavigationProps>
) {
  function Navigable(props: P) {
    const navigateTo = useNavigation()

    return h(Component, {
      ...props,
      navigateTo,
    })
  }

  return Navigable
}
