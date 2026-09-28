import EditorialVideo from '@/components/experience/EditorialVideo';

export default function HeroMedia() {
  return <EditorialVideo
    desktop="/media/hero/hero-desktop.mp4"
    mobile="/media/hero/hero-mobile.mp4"
    desktopPoster="/media/hero/hero-desktop.webp"
    mobilePoster="/media/hero/hero-mobile.webp"
    label="Moda urbana en una terraza al atardecer"
    eager
  />;
}
