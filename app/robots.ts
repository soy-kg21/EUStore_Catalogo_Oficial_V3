import type {MetadataRoute} from 'next';
import {ORIGIN} from '@/lib/config';
import {isIndexingEnabled} from '@/lib/seo';

export default function robots():MetadataRoute.Robots {
  return {
    rules:isIndexingEnabled()
      ? {userAgent:'*',allow:'/',disallow:['/api/']}
      : {userAgent:'*',disallow:'/'},
    sitemap:ORIGIN+'/sitemap.xml',
  };
}
