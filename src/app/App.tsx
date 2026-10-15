import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
import { ComingSoon } from './ComingSoon';
import { StartSplash } from './StartSplash';
import { ThemeSync } from './ThemeSync';
import { strings } from '@/strings';

export function App() {
  const [started, setStarted] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeSync />
      {!started ? (
        <StartSplash onStart={() => setStarted(true)} />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="stories" element={<ComingSoon title={strings.nav.stories} />} />
              <Route path="letters" element={<ComingSoon title={strings.nav.letters} />} />
              <Route path="numbers" element={<ComingSoon title={strings.nav.numbers} />} />
              <Route path="songs" element={<ComingSoon title={strings.nav.songs} />} />
              <Route path="stickers" element={<ComingSoon title={strings.nav.stickers} />} />
              <Route path="grown-ups" element={<ComingSoon title={strings.nav.grownUps} />} />
              <Route path="*" element={<HomePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </ErrorBoundary>
  );
}
