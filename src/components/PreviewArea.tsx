import styles from './PreviewArea.module.css';

export default function PreviewArea() {
  return (
    <main className={styles.preview}>
      <div className={styles.mockApp}>
        <header className={styles.mockHeader}>
          <div className={styles.logo}>BrandUI</div>
          <nav className={styles.nav}>
            <a href="#">Dashboard</a>
            <a href="#">Settings</a>
            <a href="#">Profile</a>
          </nav>
          <button className={styles.buttonPrimary}>Upgrade</button>
        </header>

        <div className={styles.mockContent}>
          <div className={styles.hero}>
            <h1>Welcome to your Dashboard</h1>
            <p>Manage your settings, users, and billing from this central hub.</p>
            <div className={styles.actions}>
              <button className={styles.buttonPrimary}>Get Started</button>
              <button className={styles.buttonSecondary}>Learn More</button>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>Total Users</h3>
              <p className={styles.stat}>12,450</p>
              <span className={styles.badge}>+15% this week</span>
            </div>
            <div className={styles.card}>
              <h3>Revenue</h3>
              <p className={styles.stat}>$45,200</p>
              <span className={styles.badge}>+8% this week</span>
            </div>
            <div className={styles.card}>
              <h3>Active Sessions</h3>
              <p className={styles.stat}>1,204</p>
              <span className={styles.badge}>-2% this week</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
