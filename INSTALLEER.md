# 🐛 BadgePopup callback fix

Next.js 16 / Turbopack staat geen functies meer toe als prop van server → client. De `onSeen` callback in `BadgePopup` was overbodig (server markeert badges al meteen als gezien voor de render).

## Fix

Twee bestanden:
- `components/BadgePopup.tsx` — `onSeen` prop verwijderd, useEffect cleaner
- `app/student/dashboard/page.tsx` — geen callback meer doorgegeven

## Installatie

```cmd
cd %USERPROFILE%\downloads\twentyone-boom-badgepopup-fix
xcopy app %USERPROFILE%\downloads\twentyone-boom\app\ /E /Y
xcopy components %USERPROFILE%\downloads\twentyone-boom\components\ /E /Y
```

Hot reload pakt het op.
