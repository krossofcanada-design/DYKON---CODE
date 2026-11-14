# Image assets

Files in this folder are served from `/assets/`.

- `activities/`: activity images (`activity-01.webp` through `activity-24.webp`, except day 6, which uses the puzzle).
- `calendar/`: the 24 calendar door images.
- `storybook/`: the 24 chapter illustrations (`storybook-01.webp` through `storybook-24.webp`). Placement and text wrapping are configured in `src/components/organisms/StoryReader.tsx`.
- `puzzle/`: the puzzle outline, with the 24 individual pieces in `pieces/`.
- `icons/`: book, scissors, quiz, and ticket icons.
- `illustrations/`: feather, crown, mailbox, sleigh, and bedtime illustrations.
- `backgrounds/`: the forest page background.
- `branding/`: the footer brand image.

Calendar door and puzzle piece paths are stored in `src/data/calendar.json` and `src/data/puzzle.json`. Activity paths are generated from the day number in `src/pages/DayPage.tsx`; feature icon paths are generated in `src/components/molecules/FeatureStrip.tsx`.
