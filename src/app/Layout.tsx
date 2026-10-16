import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BigButton } from '@/components/BigButton';
import { BackIcon, HomeIcon } from '@/art/Icons';
import { LivingSky } from '@/art/LivingSky';
import { strings } from '@/strings';

/** Screens where moving birds would distract (reading, typing, recording, settings). */
const CALM = /^\/(stories\/|letters\/|numbers\/|songs\/|studio|grown-ups)/;

/** App shell: living background, plus persistent Home and Back buttons on every screen except Home. */
export function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const atHome = pathname === '/';

  return (
    <div className="relative isolate flex min-h-full flex-col overflow-x-hidden">
      <LivingSky calm={CALM.test(pathname)} />
      {!atHome && (
        <nav className="flex items-center justify-between px-3 pt-3 sm:px-4" aria-label="Main">
          <BigButton size="tap" label={strings.back} icon={<BackIcon />} onClick={() => navigate(-1)} />
          <BigButton size="tap" label={strings.home} icon={<HomeIcon />} onClick={() => navigate('/')} />
        </nav>
      )}
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
