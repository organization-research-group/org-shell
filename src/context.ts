"use strict";

import { createContext } from 'react'
import Route from './Route'
import { Opts, Params, SerializeValue, DeserializeValue } from './types'

export type NavigationProps = {
  navigateTo: (route: Route, pushState?: boolean) => void
}

export const NavigationContext = createContext<
  NavigationProps | null
>(null)

export interface ORGShellConfigProps {
  serializeValue: SerializeValue;
  deserializeValue: DeserializeValue;
}

export const OrgShellConfigContext = createContext<
  ORGShellConfigProps | null
>(null)
