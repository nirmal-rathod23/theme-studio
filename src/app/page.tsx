import EditorSidebar from '@/components/EditorSidebar';
import PreviewArea from '@/components/PreviewArea';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.layout}>
      <EditorSidebar />
      <PreviewArea />
    </div>
  );
}
