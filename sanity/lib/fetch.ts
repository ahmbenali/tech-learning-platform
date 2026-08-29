import 'server-only'

import type {QueryParams} from '@sanity/client'

import {client} from './client'

type SanityFetchOptions = {
  params?: QueryParams
  revalidate?: number | false
}

export async function sanityFetch<T>(
  query: string,
  {params = {}, revalidate = 60}: SanityFetchOptions = {},
): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {revalidate},
  })
}
