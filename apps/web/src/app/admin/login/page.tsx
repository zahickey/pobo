import { loginAction } from '../actions';
import styles from '../admin.module.css';

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>PoBo admin</h1>
      {error && <div className={styles.error}>Wrong password.</div>}
      <form action={loginAction} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoFocus required />
        </div>
        <button type="submit" className={styles.submitButton}>
          Sign in
        </button>
      </form>
    </div>
  );
}
