import AnimeShopPage from '@/components/anime/AnimeShopPage';
import {collectionFilters,type AnimeSearchParams} from '@/components/anime/AnimeCollectionRoute';
export const metadata={title:'Anime Shop | Todas las colecciones',alternates:{canonical:'/shop'}};
export default async function Page({searchParams}:{searchParams:AnimeSearchParams}){return <AnimeShopPage filters={await collectionFilters('',searchParams)}/>;}
