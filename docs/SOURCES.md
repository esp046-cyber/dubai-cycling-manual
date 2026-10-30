# Sources & Verification

Tips are practical guidance, not legal advice. Before relying on any rule, confirm it with:

- Roads and Transport Authority (RTA): rta.ae, call centre 800 9090
- Dubai Police: dubaipolice.gov.ae, emergency 999
- Dubai Ambulance: 998

## Items most likely to change

- Helmet and high-visibility clothing requirements
- Which roads and tracks are open to cyclists
- Metro rules for bringing bicycles on board and Route 2020 station details
- Fine amounts
- Coordinates in this app are approximate area centres and must be confirmed in a maps app

## Review checklist when updating tips

1. Check the RTA and Dubai Police sites for rule changes.
2. Edit `assets/tips-data.js`.
3. Run `npm test`.
4. Bump `VERSION` in `service-worker.js`.
5. Run `npm run build` to regenerate the ZIP and `zip-builder.html`.
