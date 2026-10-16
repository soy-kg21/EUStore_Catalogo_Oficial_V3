import {CollectionRoute,categoryMetadata,collectionParams,type AnimeSearchParams} from '@/components/anime/AnimeCollectionRoute';
export function generateStaticParams(){return collectionParams('rock').map(categoria=>({categoria}));}
export async function generateMetadata({params}:{params:Promise<{categoria:string}>}){return categoryMetadata('rock',(await params).categoria);}
export default async function Page({params,searchParams}:{params:Promise<{categoria:string}>;searchParams:AnimeSearchParams}){return <CollectionRoute line="rock" slug={(await params).categoria} searchParams={searchParams}/>;}
