import SocialLinks from '@/components/store/SocialLinks';
import styles from './anime-social.module.css';

export default function AnimeSocialLinks(){
 return <section className={styles.section} aria-labelledby="anime-social-title">
  <h2 id="anime-social-title">Sigue la <span>evolución.</span></h2>
  <SocialLinks/>
 </section>;
}
