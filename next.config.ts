import type {NextConfig} from 'next';
import animeIndex from './data/anime-index.json';
import publicRoutes from './data/anime-public-routes.json';
const paths=publicRoutes as Record<string,{path:string}>;
const nextConfig:NextConfig={distDir:'.next-native',images:{qualities:[75,85,90],formats:['image/webp']},redirects:()=>Object.entries(animeIndex.aliases).map(([source,target])=>({source:`/anime/${source.toLowerCase()}`,destination:paths[target].path,permanent:true}))};
export default nextConfig;
