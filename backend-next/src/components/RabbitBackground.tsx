import styles from "./rabbit.module.css";

export default function RabbitBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.bg} />
      <div className={styles.rabbit}>🐰</div>
      <div className={styles.inner}>{children}</div>
    </div>
  );
}

