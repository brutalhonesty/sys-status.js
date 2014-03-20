# Grunt TODO

## app/scripts/controllers/main.js

* **TODO** `(line 10)`  we could load some markup to say "Create a component now"
* **TODO** `(line 72)`  figure out how this changes when the data is repainted
* **TODO** `(line 114)`  figure out a way to poll new metric data.
* **TODO** `(line 139)`  figure out how this changes when the data is repainted
* **TODO** `(line 295)`  and setup the function to do it as well
* **TODO** `(line 668)`  figure out why these are here
* **TODO** `(line 679)`  repaint the graph with new changes

## app/scripts/directives/main.js

* **TODO** `(line 4)`  we can make this more generalized
* **TODO** `(line 43)`  Figure out how to call a template, bring in as string and dump into page

## lib/controllers/components.js

* **TODO** `(line 54)` , when we update the status, we need to create a new incident if the status is not operational

## lib/controllers/customize.js

* **TODO** `(line 59)`  possibly check for 304 (Not Modified) as well
* **TODO** `(line 233)`  add session checking if wanted

## lib/controllers/incidents.js

* **TODO** `(line 336)`  fix this

## lib/controllers/maintenance.js

* **TODO** `(line 100)`  Trigger closing of any maintenance stuff that's still open for this maintenance incident
* **TODO** `(line 186)`  trigger events for boolean values and anything else we need to do to kick start the maintenance with new times.
* **TODO** `(line 317)`  trigger events if remindSubs and/or setProgress is enabled.

## lib/controllers/metrics.js

* **TODO** `(line 214)`  delete req.body.email client-side
* **TODO** `(line 238)` : X-axis is disabled from changing right now so it should also not be updated in DB either.
* **TODO** `(line 349)`  may some throttling to prevent bruteforce
* **TODO** `(line 364)`  may some throttling to prevent bruteforce

## app/views/index.html

* **TODO** `(line 22)`  need to add these files to bower-install grunt task somehow -->
* **TODO** `(line 78)`  need to add these files to bower-install grunt task somehow -->

## app/views/partials/metrics/metrics.html

* **TODO** `(line 23)` : Need to figure out why if we switch one different than the first one, that the first one switches.-->

## app/views/partials/statusPage.html

* **TODO** `(line 13)`  If incident is resolved, don't show here -->
* **TODO** `(line 39)`  make sure we don't slice the values in production. Only good for testing. -->
* **TODO** `(line 40)`  if we want to add the y axis label again, use yAxisLabel="{{metric.suffix}}" -->
