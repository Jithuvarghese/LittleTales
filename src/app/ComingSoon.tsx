import { CharacterHost } from '@/components/CharacterHost';
import { strings } from '@/strings';

/** Placeholder screen for sections built in later phases. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <CharacterHost expression="thinking" size={200} />
      <h1 className="font-ui text-5xl font-extrabold">{title}</h1>
      <p className="font-ui text-3xl">{strings.comingSoon}</p>
    </div>
  );
}
