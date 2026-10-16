import {CollectionRoute,categoryMetadata,collectionParams,type AnimeSearchParams} from '@/components/anime/AnimeCollectionRoute';
export function generateStaticParams(){return collectionParams('anime').map(slug=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){return categoryMetadata('anime',(await params).slug);}
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:AnimeSearchParams}){return <CollectionRoute line="anime" slug={(await params).slug} searchParams={searchParams}/>;}
