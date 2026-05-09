# n8n Workflow Outline

## Obiectiv

Sa rulam zilnic:

1. extragere loguri Railway
2. transformare in CSV
3. upload CSV in platforma web prin browser automation

## Varianta MVP recomandata

### Workflow 1: Railway -> CSV

Noduri:

1. `Schedule Trigger`
   Ruleaza zilnic, de exemplu la 08:00.
2. `Execute Command` sau `HTTP Request`
   - `Execute Command` daca folosim Railway CLI
   - `HTTP Request` daca folosim Railway Public API
3. `Code`
   Normalizeaza logurile in forma minima:
   - `timestamp`
   - `service`
   - `environment`
   - `level`
   - `message`
   - `deployment_id`
   - `source`
   - `raw_json`
4. `Spreadsheet File`
   Genereaza CSV
5. `Write Binary File` sau `HTTP Request`
   Pastreaza fisierul local sau il trimite uploaderului

### Workflow 2: Upload CSV in platforma

Noduri:

1. `Webhook` sau `Manual Trigger`
2. `HTTP Request`
   Trimite fisierul CSV catre un uploader Playwright
3. `IF`
   Verifica succesul upload-ului
4. `Send Email` sau alta notificare
   Doar pentru erori sau esec

## Ce lipseste ca sa mergem pe date reale

- token Railway
- numele serviciului Railway
- numele environmentului Railway
- URL-ul paginii de upload din platforma
- tipul de login din platforma

## Decizie tehnica recomandata

Pentru inceput:

- folosim raw logs
- generam un CSV zilnic
- browser automation il pastram separat de n8n, intr-un mic uploader Playwright

Motiv:

- e mai stabil
- e mai usor de depanat
- nu legam credentialele browser direct in logica de extractie
