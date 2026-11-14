# Lille Fjer Christmas calendar

A complete interactive study prototype built from Klaudia Raniszewska's (Ross) supplied designs, images, React starter project, chapters, activities and quiz document.

## Run locally

Use Node.js 24, then run these commands from this folder.

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. To check the code and create a production build, run the following commands.

```bash
npm test
npm run build
npm run preview
```

## Try the experience

The calendar starts on a simulated December 6, 2026. Open the small **Prototype** menu at the bottom left to change the date, use the real date in Denmark, load the example with 22 tickets, switch to a guest, or reset the current profile.

1. Open **Prototype** and select **Vis 6. december med 22 lodder**.
2. Drag lid 6 to the red mailbox. The total becomes 23.
3. Follow **Besøg dagen** to the chapter, puzzle and quiz.
4. Choose the correct quiz answer. The total becomes 28, and day 6 shows six tickets when you return.
5. Try the same flow as a guest. Content opens, while ticket counters stay hidden.

For keyboard or tap access, choose a lid and then activate the mailbox. For the puzzle, choose a piece and then its slot. Dragging works with pointer events for mouse, pen and touch. Browser layout checks used desktop and a 390-pixel mobile frame. Physical-device testing remains useful for native touch and speech behavior.

## Rules and storage

- Each lid unlocks at midnight in Europe/Copenhagen on its date in December 2026 and remains available afterward.
- Posting a lid gives a signed-in test profile one ticket, once.
- The first quiz answer gives five tickets if correct or one if incorrect, once. Guests can answer without earning tickets.
- Totals are derived from individual days. Returning to the calendar shows the lid award and quiz award separately.
- Guest progress and each normalized test email have separate records. Guest actions are not transferred into a profile or awarded retroactively.
- The December 6 puzzle uses the supplied gold outline board and all 24 illustrated pieces. Progress persists. Completing it does not add ordinary quiz tickets.
- Local browser storage holds progress. Web Locks serialize updates across tabs when supported. The prototype includes a local reset and handles unavailable or invalid browser storage.
- Moving the preview date backward locks future days again while preserving previously earned totals.

## Prototype boundaries

Test login accepts an email-shaped address to select a local profile. It sends no sign-in email and has no password verification or production account backend. The prototype does not create entries in a real prize draw or subscribe anyone to a newsletter. A live campaign needs authenticated server storage, server-enforced award rules, finalized prize details and approved competition/privacy content.

Story audio uses the device’s speech synthesis because recordings were not supplied. Available Danish voices vary by browser and device. Buttons support play, pause, resume and stop. Recorded narration can replace this component later.

The visual implementation uses the supplied artwork, responsive HTML story text, and recreated CSS borders and parchment. Wordmarks use text, and decorative frames approximate the design. The missing December 6 quiz question was filled from the supplied page mockup. December 6 presents the special puzzle in place of that day’s craft activity. All 24 original craft records remain in the data file.

## Project structure

| Location | Purpose |
| --- | --- |
| `src/App.tsx` | Page routing, shared progress and dialogs |
| `src/types/calendar.ts` | Content and progress types |
| `src/data/calendar.json` | All 24 chapters, activities, quiz questions, answers and source links |
| `src/data/puzzle.json` | Placement geometry for the 24 puzzle pieces |
| `src/state/progress.ts` | Pure rules for dates, opening, answers, pieces and ticket totals |
| `src/state/store.ts` | React subscription and browser persistence |
| `src/hooks/usePointerDrag.ts` | Shared pointer handling |
| `src/components/atoms` | Button and ornament |
| `src/components/molecules` | Ticket counter and feature strip |
| `src/components/organisms` | Calendar, puzzle, quiz, story reader, header and footer |
| `src/components/templates` | Shared page layout |
| `src/pages` | Landing page and reusable daily page |
| `src/styles/style.scss` | Responsive styling and animations |
| `public/assets` | Optimized supplied artwork |
| `public/fonts` | Locally hosted Cormorant Garamond and Inter fonts |
| `tests/progress.test.ts` | Date, ticket, persistence and profile regression checks |

Navigation uses hash routes so the same build works on ordinary static hosting. The local `.openai` configuration belongs to the private preview hosting environment and is omitted from the downloadable source archive.
