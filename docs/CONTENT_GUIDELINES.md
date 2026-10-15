# Content Guidelines and QA Checklist

Every story, rhyme and quiz must pass this checklist before it ships.

## Tone
- Gentle, warm, positive. Problems are small and solved kindly, often by friends helping each other.
- No violence, peril that lingers, frightening imagery, villains who are scary, or punishment.
- No food shaming, body shaming, or "good/bad child" labels.
- Mistakes are normal and okay. Characters try again.

## Inclusion
- Diverse names, families, homes and places, including Indian and other global settings (festivals, foods, weather, cities and villages).
- No stereotypes about gender, culture, ability, religion or appearance. Anyone can be brave, gentle, clever or kind.
- Festivals and traditions are shown respectfully and simply, with a parent prompt if context helps.

## Language
- 1–3 short sentences per page. Mostly one- and two-syllable words.
- Repetition and rhythm are good. Sound words (buzz, splash, moo) are great.
- Speech in quotes, with who is speaking made clear.
- Spell-check and read the story aloud once before committing.

## Originality and licences
- Original stories only, or public-domain tales retold in new simple words (Aesop, Panchatantra, Jataka and similar, translated and retold by us).
- No copyrighted characters, books, songs or catchphrases.
- Rhymes must be verified public domain; note the source and date in the rhyme file.
- Every asset added has an entry in `licenses.json` and `docs/ATTRIBUTIONS.md`.

## Quizzes
- Maximum 4 options, exactly one correct, all options drawn from the art library.
- The question can be answered from the picture or the story just heard.
- Never trick questions.

## Content QA checklist (per story)
- [ ] `npm run content:validate` passes
- [ ] 8–20 story pages; 1–3 sentences each
- [ ] Tone, inclusion and originality rules above are met
- [ ] Every page has a scene; the main character is visible on most pages
- [ ] At least two tappable hotspots across the story, each with a sound or voice
- [ ] Quizzes (1–2 per story) make sense and use clear pictures
- [ ] Parent prompts are helpful and optional
- [ ] Read once in each mode: Read to me, Grown-up reads, I'll try
- [ ] Narration reviewed (after audio generation); highlighting roughly in sync
- [ ] Checked on a phone-sized screen and a tablet
