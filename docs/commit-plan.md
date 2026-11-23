# Rencana Commit Bertahap

Briefing minta "progressive commits". Saran urutan commit (jalankan di komputermu supaya otomatis atas namamu):

1. `chore: init project structure and .gitignore`  -> package.json, .gitignore, .env.example
2. `feat: add database schema for loans` -> sql/schema.sql
3. `feat: add Express server with DB connection and /health` -> src/db.js, src/server.js (bagian awal)
4. `feat: implement CRUD endpoints for loans`
5. `chore: add check-db connectivity script` -> scripts/check-db.js
6. `docs: add architecture diagram and design brief` -> docs/
7. `docs: add README and deployment plan`
8. `docs: add AWS evidence` -> evidence/ (setelah setup AWS selesai)
