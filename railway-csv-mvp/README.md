# Railway CSV MVP

Starter local pentru primul pas din pipeline-ul nostru:

- ia loguri brute din Railway
- le normalizeaza minimal
- le scrie in CSV

Deocamdata ne concentram doar pe `Railway -> CSV`. Upload-ul in platforma ta prin browser automation il legam imediat dupa ce validam formatul si volumul de date.

## Ce am pregatit

- un script `scripts/railway-logs-to-csv.mjs`
- suport pentru input din fisier sau direct din Railway CLI
- output CSV cu coloane sigure pentru raw logs

## Ce trebuie sa faci tu

1. Creeaza un token Railway.
   Poti folosi un `Project token` sau un token mai larg, in functie de cum vrei sa rulam extractia.
2. Spune-mi numele serviciului si environmentului din Railway.
3. Trimite-mi URL-ul paginii din platforma ta unde se face upload-ul CSV.
4. Spune-mi tipul de login pentru platforma ta:
   `email/parola`, `Google`, sau altceva.

Nu-mi trimite parola in chat. O vom pune ulterior in variabile de mediu sau credentials.

## Rulare

### Varianta 1: dintr-un fisier cu logs

```bash
node scripts/railway-logs-to-csv.mjs --input ./sample-logs.json --output ./out/test.csv
```

### Varianta 2: direct din Railway CLI

```bash
RAILWAY_SERVICE="service-name" \
RAILWAY_ENVIRONMENT="production" \
RAILWAY_LOOKBACK="1d" \
node scripts/railway-logs-to-csv.mjs
```

Scriptul incearca sa ruleze:

```bash
railway logs --json --service <service> --environment <env> --since <lookback>
```

## Coloane CSV

- `timestamp`
- `service`
- `environment`
- `level`
- `message`
- `deployment_id`
- `source`
- `raw_json`

Chiar daca logurile sunt dezordonate, coloana `raw_json` pastreaza payload-ul original.
