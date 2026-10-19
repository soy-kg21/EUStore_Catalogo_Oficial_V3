import EditorialVideo from '@/components/experience/EditorialVideo';

export default function HeroMedia() {
  return <EditorialVideo
    desktop="/media/hero/hero-desktop-original.mp4"
    mobile="/media/hero/hero-mobile-original.mp4"
    desktopPoster="/media/hero/hero-desktop-original.webp"
    mobilePoster="/media/hero/hero-mobile-original.webp"
    label="Moda urbana en una terraza al atardecer"
    eager
  />;
}
