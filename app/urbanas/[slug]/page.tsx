import {CollectionRoute,categoryMetadata,collectionParams,type AnimeSearchParams} from '@/components/anime/AnimeCollectionRoute';
export function generateStaticParams(){return collectionParams('urbanos').map(slug=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){return categoryMetadata('urbanos',(await params).slug);}
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:AnimeSearchParams}){return <CollectionRoute line="urbanos" slug={(await params).slug} searchParams={searchParams}/>;}
