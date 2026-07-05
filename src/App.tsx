import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Home } from '@/pages/Home';
import { Chat } from '@/pages/Chat';
import { Placeholder } from '@/pages/Placeholder';
import { NotFound } from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/analysis/trend" element={<Placeholder title="趋势分析" />} />
        <Route path="/analysis/table" element={<Placeholder title="明细表" />} />
        <Route path="/settings" element={<Placeholder title="设置" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
