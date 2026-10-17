import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
import { StartSplash } from './StartSplash';
import { ThemeSync } from './ThemeSync';
import { ScreenTime } from './ScreenTime';
import { CharacterHost } from '@/components/CharacterHost';
import { AudioManager } from '@/services/AudioManager';

// Feature areas are split into their own chunks to keep the first load small.
const Library = lazy(() => import('@/features/stories/Library').then((m) => ({ default: m.Library })));
const Reader = lazy(() => import('@/features/stories/Reader').then((m) => ({ default: m.Reader })));
const LettersHub = lazy(() => import('@/features/letters/LettersHub').then((m) => ({ default: m.LettersHub })));
const MeetLetter = lazy(() => import('@/features/letters/MeetLetter').then((m) => ({ default: m.MeetLetter })));
const FindKey = lazy(() => import('@/features/letters/FindKey').then((m) => ({ default: m.FindKey })));
const FallingLetters = lazy(() => import('@/features/letters/FallingLetters').then((m) => ({ default: m.FallingLetters })));
const AlphabetSong = lazy(() => import('@/features/letters/AlphabetSong').then((m) => ({ default: m.AlphabetSong })));
const numbers = () => import('@/features/numbers/Numbers');
const NumbersHub = lazy(() => numbers().then((m) => ({ default: m.NumbersHub })));
const MeetNumber = lazy(() => numbers().then((m) => ({ default: m.MeetNumber })));
const CountAndTap = lazy(() => numbers().then((m) => ({ default: m.CountAndTap })));
const WhichHasMore = lazy(() => numbers().then((m) => ({ default: m.WhichHasMore })));
const AddPictures = lazy(() => numbers().then((m) => ({ default: m.AddPictures })));
const songs = () => import('@/features/songs/Songs');
const SongsList = lazy(() => songs().then((m) => ({ default: m.SongsList })));
const RhymePlayer = lazy(() => songs().then((m) => ({ default: m.RhymePlayer })));
const StickerBook = lazy(() => import('@/features/rewards/StickerBook').then((m) => ({ default: m.StickerBook })));
// Recording studio exists only in development; the production build drops it entirely.
const Studio = import.meta.env.DEV ? lazy(() => import('@/features/studio/Studio').then((m) => ({ default: m.Studio }))) : null;
const games = () => import('@/features/games/GamesHub');
const GamesHub = lazy(() => games().then((m) => ({ default: m.GamesHub })));
const CatchGame = lazy(() => import('@/features/games/CatchGame').then((m) => ({ default: m.CatchGame })));
const MatchGame = lazy(() => import('@/features/games/MatchGame').then((m) => ({ default: m.MatchGame })));
const WordBuilder = lazy(() => import('@/features/letters/WordBuilder').then((m) => ({ default: m.WordBuilder })));
const CastGallery = import.meta.env.DEV ? lazy(() => import('@/features/studio/CastGallery').then((m) => ({ default: m.CastGallery }))) : null;
const StoryPreview = import.meta.env.DEV ? lazy(() => import('@/features/studio/StoryPreview').then((m) => ({ default: m.StoryPreview }))) : null;
const colourz = () => import('@/features/colours/Colours');
const ColoursHub = lazy(() => colourz().then((m) => ({ default: m.ColoursHub })));
const MeetColour = lazy(() => colourz().then((m) => ({ default: m.MeetColour })));
const FindColour = lazy(() => colourz().then((m) => ({ default: m.FindColour })));
const PaintIt = lazy(() => colourz().then((m) => ({ default: m.PaintIt })));
const flagz = () => import('@/features/flags/Flags');
const FlagsHub = lazy(() => flagz().then((m) => ({ default: m.FlagsHub })));
const MeetFlag = lazy(() => flagz().then((m) => ({ default: m.MeetFlag })));
const FindFlag = lazy(() => flagz().then((m) => ({ default: m.FindFlag })));
const FlagPairs = lazy(() => flagz().then((m) => ({ default: m.FlagPairs })));
const ParentArea = lazy(() => import('@/features/parent/ParentArea').then((m) => ({ default: m.ParentArea })));

function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <CharacterHost expression="thinking" size={140} />
    </div>
  );
}

export function App() {
  const [started, setStarted] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeSync />
      {!started ? (
        <StartSplash
          onStart={() => {
            AudioManager.unlock();
            AudioManager.sfx('sparkle', 'ui');
            setStarted(true);
          }}
        />
      ) : (
        <BrowserRouter>
          <ScreenTime />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="stories" element={<Library />} />
                <Route path="stories/:id" element={<Reader />} />
                <Route path="letters" element={<LettersHub />} />
                <Route path="letters/meet" element={<MeetLetter />} />
                <Route path="letters/find" element={<FindKey />} />
                <Route path="letters/bubbles" element={<FallingLetters />} />
                <Route path="letters/name" element={<WordBuilder />} />
                <Route path="colours" element={<ColoursHub />} />
                <Route path="colours/meet" element={<MeetColour />} />
                <Route path="colours/find" element={<FindColour />} />
                <Route path="colours/paint" element={<PaintIt />} />
                <Route path="flags" element={<FlagsHub />} />
                <Route path="flags/meet" element={<MeetFlag />} />
                <Route path="flags/find" element={<FindFlag />} />
                <Route path="flags/pairs" element={<FlagPairs />} />
                <Route path="games" element={<GamesHub />} />
                <Route path="games/catch" element={<CatchGame />} />
                <Route path="games/match" element={<MatchGame />} />
                <Route path="letters/song" element={<AlphabetSong />} />
                <Route path="numbers" element={<NumbersHub />} />
                <Route path="numbers/meet" element={<MeetNumber />} />
                <Route path="numbers/find" element={<FindKey mode="numbers" />} />
                <Route path="numbers/count" element={<CountAndTap />} />
                <Route path="numbers/more" element={<WhichHasMore />} />
                <Route path="numbers/add" element={<AddPictures />} />
                <Route path="songs" element={<SongsList />} />
                <Route path="songs/:id" element={<RhymePlayer />} />
                <Route path="stickers" element={<StickerBook />} />
                <Route path="grown-ups" element={<ParentArea />} />
                {Studio && <Route path="studio" element={<Studio />} />}
                {CastGallery && <Route path="cast" element={<CastGallery />} />}
                {StoryPreview && <Route path="preview/:id?" element={<StoryPreview />} />}
                <Route path="*" element={<HomePage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      )}
    </ErrorBoundary>
  );
}
