// This is as of Next.js 14, but you could also use other dynamic functions
import { headers } from 'next/headers';

import styles from './page.module.css';

export default function ServerSide() {
  headers(); // Opt into dynamic rendering

  // This value will be evaluated at runtime
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          BAR: {process.env.BAR}
          <br />
          BAZ: {process.env.BAZ}
        </p>
      </div>
    </main>
  );
}
