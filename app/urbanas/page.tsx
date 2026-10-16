import AnimeShopPage from '@/components/anime/AnimeShopPage';
import {collectionFilters,type AnimeSearchParams} from '@/components/anime/AnimeCollectionRoute';
export const metadata={title:'Camisetas Urbanas | Evolución Urbana',description:'Elige diseños de la colección Urbanas y arma tu combo.',alternates:{canonical:'/urbanas'}};
export default async function Page({searchParams}:{searchParams:AnimeSearchParams}){return <AnimeShopPage filters={await collectionFilters('urbanos',searchParams)}/>;}
