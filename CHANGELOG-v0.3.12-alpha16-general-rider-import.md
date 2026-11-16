# Light It Up v0.3.12 — Alpha 16: General Rider Import foundation

- Adds Espacio Aguirre as the second verified real-world rider case.
- Introduces venue-aware Rider Import callbacks instead of hard-wiring every import to Auditorio Belgrano.
- Review distinguishes source-confirmed data from reconstruction estimates.
- Espacio Aguirre: reads 8.0 m width, 17.52 m overall plan depth, LX1/LX2/LX3/LFOH1/LFOH2 and the fixture legend.
- Creates only high-confidence labelled fixtures/channels from the Aguirre plan; ambiguous symbols are intentionally not invented.
- Hanging heights are reconstruction defaults because the supplied 2D plan does not specify them.
- Unknown riders now enter a generic/manual state ready for a future OCR/vision analyzer rather than pretending to have been parsed.
