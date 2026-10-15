import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BigButton } from '@/components/BigButton';
import { BackIcon, HomeIcon } from '@/art/Icons';
import { strings } from '@/strings';

/** App shell: persistent Home and Back buttons on every screen except Home. */
export function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const atHome = pathname === '/';

  return (
    <div className="flex min-h-full flex-col">
      {!atHome && (
        <nav className="flex items-center justify-between p-4" aria-label="Main">
          <BigButton label={strings.back} icon={<BackIcon />} onClick={() => navigate(-1)} />
          <BigButton label={strings.home} icon={<HomeIcon />} onClick={() => navigate('/')} />
        </nav>
      )}
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
