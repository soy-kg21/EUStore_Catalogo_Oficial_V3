import AnimeShopPage from '@/components/anime/AnimeShopPage';
import {collectionFilters,type AnimeSearchParams} from '@/components/anime/AnimeCollectionRoute';
export const metadata={title:'Camisetas Anime | Evolución Urbana',description:'Explora Anime en Anime Shop. Elige tus diseños y arma tu combo.',alternates:{canonical:'/anime'}};
export default async function Page({searchParams}:{searchParams:AnimeSearchParams}){return <AnimeShopPage filters={await collectionFilters('anime',searchParams)}/>;}
