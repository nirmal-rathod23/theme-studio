import Sidebar from '@/components/Sidebar';
import PreviewArea from '@/components/PreviewArea';

export default function Home() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <PreviewArea />
    </div>
  );
}
