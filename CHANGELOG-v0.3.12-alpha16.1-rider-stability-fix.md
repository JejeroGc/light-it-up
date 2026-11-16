# Light It Up v0.3.12 Alpha 16.1 — Rider Import Stability Fix

- Fixes editor black-screen crash after creating Espacio Aguirre from Rider Import.
- Replaces stale `loadBelgrano` handler left behind during Alpha 16 generalization.
- Validates Aguirre fixture seeds before inserting them into the lighting store.
- Keeps theatre circuit labels such as `9/24` in the fixture name while using safe numeric internal channel/address IDs.
- Invalid fixture data is skipped with a console warning instead of crashing the venue.
