# Discipline Tracker (Local-only)

Simple strict planner:
- Today (required tasks + close as completed/failed)
- Weekly (required tasks + pass/fail)
- Monthly (required outcomes + pass/fail)
- 2026 Goals (goals + milestones)
- Settings (daily task limit, optional lock, export/import)

## Run
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Notes
- Uses localStorage only (no backend).
- `@/` alias is configured in tsconfig.json.


## v2
- Tasks support subtasks + notes.
- Milestones support notes.

- Calendar page shows goal deadlines.
- Removed Top Focus from Today.

- Calendar highlights days that have goal deadlines.
- Calendar header uses month names.


## v5
- Date pickers (dropdown calendar) for goal/weekly/monthly deadlines.
- Calendar colors: blue=goal, violet=weekly, amber=monthly.
