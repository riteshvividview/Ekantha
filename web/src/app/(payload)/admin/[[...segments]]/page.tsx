import type { Metadata } from 'next'

import config from '@payload-config'
import { generatePageMetadata, RootPage } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = async ({ params, searchParams }: Args) =>
  RootPage({ config, importMap, params, searchParams })

export default Page
