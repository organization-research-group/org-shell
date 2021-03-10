"use strict";

import * as qs from 'querystring'

import { Params, Opts } from './types'

export default class Route {
  resourceName: string;
  params: Params;
  opts: Opts;

  constructor(resourceName: string, params?: Params, opts?: Opts) {
    this.resourceName = resourceName;
    this.params = params || {};
    this.opts = opts || {};
  }

  _asURL(
    serializeValue: (opt: any) => string
  ) {
    const params = qs.encode(this.params)
        , opts = qs.encode(mapObj(serializeValue, this.opts))

    let url: string = '?page=' + this.resourceName

    if (params) url += `&${params}`
    if (opts) url += `#${opts}`

    return url
  }

  static _fromPath(
    path: string,
    deserializeValue: (opt: string) => any
  ) {
    if (path[0] === '?') path = path.slice(1)

    const [ params, opts ] = path.split('#')

    const { page='', ...parsedParams } = qs.parse(params)
        , parsedOpts = mapObj(deserializeValue, qs.parse(opts))

    if (typeof page !== 'string') {
      throw new Error('Invalid value for `page` parameter: ' + page)
    }

    for (let key in parsedParams) {
      const value = parsedParams[key]

      if (!(typeof value === 'string' || typeof value === 'number')) {
        throw new Error('Query parameters must either be strings or numbers')
      }
    }

    return new Route(page, <Params>parsedParams, parsedOpts)
  }
}

function mapObj<T>(
  fn: (arg: any) => T,
  obj: Record<string, any>
): Record<string, T> {
  const mapped: Record<string, any> = {}

  Object.entries(obj).forEach(([ k, v ]) => {
    mapped[k] = fn(v)
  })

  return mapped
}
