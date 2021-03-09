"use strict";

import Route from './Route'

export type Params = Record<string, string | number>
export type Opts = Record<string, any>
export type SerializeValue = (arg: any) => string;
export type DeserializeValue = (arg: string) => any;

export interface ORGShellResource {
  name: string,
  Component: any;
  onBeforeRoute?: (
    params: Params,
    redirect: (route: Route) => void,
    extraArgs: any
  ) => void;
}

export interface ORGShellConfig {
  resources: Record<string, ORGShellResource>;
  extraArgs?: any,
  NotFoundComponent?: any;
  onRouteChange?: (route: Route, resource: ORGShellResource, extraArgs: any) => void;
  processOpts?: {
    serializeValue?: SerializeValue;
    deserializeValue?: DeserializeValue;
  }
}
