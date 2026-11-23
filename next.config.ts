import type {NextConfig} from 'next';
import animeIndex from './data/anime-index.json';
import publicRoutes from './data/anime-public-routes.json';

const paths = publicRoutes as Record<string,{path:string}>;
const previewHost = process.env.EUSTORE_PREVIEW_LAN_HOST;

const nextConfig:NextConfig = {
  devIndicators:false,
  allowedDevOrigins:['127.0.0.1',...(previewHost ? [previewHost] : [])],
  env:{EUSTORE_BUILD_CONTEXT:process.env.CONTEXT || 'local'},
  distDir:'.next-native',
  images:{unoptimized:true,qualities:[75,85,90],formats:['image/webp']},
  redirects:()=>Object.entries(animeIndex.aliases).map(([source,target])=>({
    source:'/anime/'+source.toLowerCase(),destination:paths[target].path,permanent:true,
  })),
};

export default nextConfig;
