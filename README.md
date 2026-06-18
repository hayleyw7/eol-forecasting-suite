# End-of-Life Forecasting Suite

A small, static web app that turns a handful of simple inputs into a dramatic terminal-style lifespan forecast for a fictional human-capital dashboard.

This is intentionally playful. It is not a medical, actuarial, financial, safety, or planning tool.

## Open It

From the project folder, open the HTML file directly:

`open index.html`

No install step is required.

The app runs entirely in the browser. It does not use AI, call an API, or send form data anywhere.

## Files

- `index.html` defines the app layout and form controls.
- `styles.css` handles the dashboard and terminal styling.
- `app.js` calculates the forecast, renders the terminal box, copies the rendered data, and saves inputs to `localStorage`.

## Inputs

The automatic estimate asks for:

- Birthdate
- Sex: Female, Male, or Intersex
- Region, defaulting to Global average unless a previous local selection was saved
- Smoking level
- Movement level
- Sleep quality
- Stress load

Available region options are Global average, United States, Canada, United Kingdom, Western Europe, Eastern Europe, East Asia, South Asia, Latin America, Middle East & North Africa, Sub-Saharan Africa, and Oceania.

## Calculation Notes

The app starts from a broad regional/sex baseline, applies simple lifestyle adjustments, then converts the resulting lifespan estimate into weeks.

The baseline values and adjustments are hardcoded in `app.js`. They are rough illustrative values, not sourced live data or a validated model.

The form is saved to browser `localStorage` on change and restored on the next visit in the same browser. The reset button clears that saved local state and returns the form to defaults.

The copy icon in the terminal output copies the rendered forecast text to the clipboard.

## Disclaimer

This project is for entertainment only. Lifespan cannot be reliably predicted from this form, and the app should not be used for medical, actuarial, or financial decisions.
