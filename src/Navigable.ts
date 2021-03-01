"use strict";

import React, { useContext } from 'react'

import { NavigationContext, NavigationProps } from './context'

const h = React.createElement

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
