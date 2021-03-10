"use strict";

import * as React from 'react'

import Route from './Route'
import {
  Opts,
  Params,
  SerializeValue,
  DeserializeValue,
  ORGShellResource,
} from './types'

const { createContext, useContext, useState } = React
    , h = React.createElement


/** Navigation context **/

export type ORGShellNavigationProps = {
  navigateTo: (route: Route, pushState?: boolean) => void
}

export const ORGShellNavigationContext = createContext<
  ORGShellNavigationProps | null
>(null)

export function useNavigation() {
  const { navigateTo } = useContext(ORGShellNavigationContext)!

  return navigateTo

}

export function Navigable<P>(
  Component: React.ComponentType<P & ORGShellNavigationProps>
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


/** Config context: Only for use by Link component **/

export interface ORGShellConfigProps {
  serializeValue: SerializeValue;
  deserializeValue: DeserializeValue;
}

export const ORGShellConfigContext = createContext<
  ORGShellConfigProps | null
>(null)


/** Resource context **/

export type ORGShellResourceProps = {
  loading: boolean;
  resource: ORGShellResource | null;
  params: Params | null;
  path: string | null;
}

export const ORGShellResourceContext = createContext<
  ORGShellResourceProps | null
>(null)

export function useResource() {
  const resourceProps = useContext(ORGShellResourceContext)!

  return resourceProps
}

export function ResourceAware<P>(
  Component: React.ComponentType<P & ORGShellResourceProps>
) {
  function Navigable(props: P) {
    const resourceParams = useResource()

    return h(Component, {
      ...props,
      ...resourceParams,
    })
  }

  return Navigable
}


/** Options context **/

export type UpdateOptsCallback<P> = (prevOpts: Opts<P>) => Opts<P>
export type EmptyUpdateOptsCallback<P> = (prevOpts: Opts<P>) => null

export type UpdateOpts<P> = (updateFn: UpdateOptsCallback<P> | EmptyUpdateOptsCallback<P>) => void

export type ORGShellOptionsProps<P=any> = {
  opts: Opts<P>;
  updateOpts: UpdateOpts<P>;
}

export type ORGShellOptions<P=any> = [
  opts: Opts<P>,
  updateOpts: UpdateOpts<P>
]

export const ORGShellOptionsContext = createContext<
  ORGShellOptionsProps | null
>(null)

export function useOptions(): ORGShellOptions {
  const { opts, updateOpts } = useContext(ORGShellOptionsContext)!

  return [ opts, updateOpts ]
}

export function OptionsAware<P>(
  Component: React.ComponentType<P & ORGShellOptionsProps>
) {
  function Navigable(props: P) {
    const [ opts, updateOpts ] = useOptions()

    return h(Component, {
      ...props,
      opts,
      updateOpts,
    })
  }

  return Navigable
}
