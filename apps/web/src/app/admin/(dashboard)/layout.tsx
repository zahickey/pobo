import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '../../../lib/admin-auth';
import { logoutAction } from '../actions';
import styles from '../admin.module.css';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  return (
    <div className={styles.page}>
      <div className={styles.nav}>
        <div className={styles.navLinks}>
          <a href="/admin">Dashboard</a>
          <a href="/admin/venues/new">+ Venue</a>
          <a href="/admin/series/new">+ Event series</a>
        </div>
        <form action={logoutAction}>
          <button type="submit" className={styles.logoutButton}>
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
