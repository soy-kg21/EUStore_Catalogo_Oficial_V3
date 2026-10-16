import AnimeShopPage from '@/components/anime/AnimeShopPage';
import {collectionFilters,type AnimeSearchParams} from '@/components/anime/AnimeCollectionRoute';
export const metadata={title:'Camisetas Cartoon | Evolución Urbana',description:'Explora Cartoon en Anime Shop. Elige tus diseños y arma tu combo.',alternates:{canonical:'/cartoon'}};
export default async function Page({searchParams}:{searchParams:AnimeSearchParams}){return <AnimeShopPage filters={await collectionFilters('cartoon',searchParams)}/>;}
