import {notFound, permanentRedirect} from 'next/navigation';
import {catalogSections} from '@/lib/catalog-collections';
import {categories} from '@/lib/config';
import {catalogQueryString, type Params} from '@/lib/product-query';

export default async function Page({params, searchParams}: {
  params: Promise<{slug: string}>;
  searchParams: Promise<Params>;
}) {
  const {slug} = await params;
  const path = categories.find(category => category.slug === slug)?.path ??
    Object.values(catalogSections).find(section => section.path === '/' + slug)?.path;
  if (!path) notFound();

  permanentRedirect(path + catalogQueryString(await searchParams));
}
