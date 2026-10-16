import AnimeShopPage from '@/components/anime/AnimeShopPage';
import {collectionFilters,type AnimeSearchParams} from '@/components/anime/AnimeCollectionRoute';
export const metadata={title:'Camisetas Rock | Evolución Urbana',description:'Explora Rock en Anime Shop. Elige tus diseños y arma tu combo.',alternates:{canonical:'/rock'}};
export default async function Page({searchParams}:{searchParams:AnimeSearchParams}){return <AnimeShopPage filters={await collectionFilters('rock',searchParams)}/>;}
