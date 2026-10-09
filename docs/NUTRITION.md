# Nutrition model

## Daily accounting

Food nutrition is multiplied by the logged number of servings, including fractional portions. Meal totals roll up into daily calories, protein, carbohydrates, and fat. Remaining values subtract logged intake from the selected targets. Water is logged in 250 ml increments and weight in kg.

Initial targets are entered manually. Carbohydrate targets use the calories remaining after protein and fat, with 4 kcal/g for protein and carbohydrates and 9 kcal/g for fat.

## Weight trends

The displayed smoothed trend is an exponential moving average: 25% of the newest weight and 75% of the preceding trend value. It is a visual aid; weekly expenditure estimation uses a linear regression of recorded weights.

## Weekly check-in

A check-in needs 14 completed intake days and at least 4 weigh-ins spanning 14 days during the preceding 28 days. Today's intake is excluded. Mark a diary day complete after all meals are logged.

Estimated daily expenditure equals mean completed-day calorie intake minus the daily weight slope multiplied by 7,700 kcal/kg. Goal adjustments are minus 300 kcal for loss, plus 200 for gain, and zero for maintenance.

Each weekly suggestion changes the target by at most 100 kcal. Targets stay within 1,200–5,000 kcal and must accommodate the protein target. Protein stays steady and fat is reduced if necessary. The suggestion must be reviewed and applied by the user.

## Interpretation

This is a transparent prototype estimator, not MacroFactor's proprietary algorithm or a measured metabolic rate. Incomplete logging, sparse weigh-ins, and short-term water-weight changes affect estimates. Starter foods are approximate, and community barcode data should be checked against packaging.
