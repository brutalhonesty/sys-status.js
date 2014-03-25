# Grunt TODO

## app/scripts/controllers/main.js

* **TODO** `(line 10)`  we could load some markup to say "Create a component now"
* **TODO** `(line 73)`  We would change this check to a for-loop and check for 'not completion' incase we flagged an incident instead of actually deleting it
* **TODO** `(line 80)`  Figure out how this changes when the data is repainted
* **TODO** `(line 122)`  Figure out a way to poll new metric data.
* **TODO** `(line 147)`  figure out how this changes when the data is repainted
* **TODO** `(line 303)`  and setup the function to do it as well
* **TODO** `(line 676)`  figure out why these are here
* **TODO** `(line 687)`  repaint the graph with new changes

## app/scripts/directives/main.js

* **TODO** `(line 4)`  we can make this more generalized
* **TODO** `(line 43)`  Figure out how to call a template, bring in as string and dump into page

## lib/controllers/components.js

* **TODO** `(line 61)` , when we update the status, we need to create a new incident if the status is not operational

## lib/controllers/customize.js

* **TODO** `(line 59)`  possibly check for 304 (Not Modified) as well
* **TODO** `(line 240)`  add session checking if wanted

## lib/controllers/maintenance.js

* **TODO** `(line 106)`  Trigger closing of any maintenance stuff that's still open for this maintenance incident
* **TODO** `(line 195)`  trigger events for boolean values and anything else we need to do to kick start the maintenance with new times.
* **TODO** `(line 335)`  trigger events if remindSubs and/or setProgress is enabled.

## lib/controllers/metrics.js

* **TODO** `(line 264)` : X-axis is disabled from changing right now so it should also not be updated in DB either.
* **TODO** `(line 357)`  We might not want to truely delete a metric, we might just want to mark as deleted and continue to store for history purposes.
* **TODO** `(line 382)`  may some throttling to prevent bruteforce
* **TODO** `(line 410)`  may some throttling to prevent bruteforce

## lib/controllers/register.js

* **TODO** `(line 83)`  We might want to add an array of sites that a user is linked to

## lib/controllers/team.js

* **TODO** `(line 34)`  Finish getting members from DB.
* **TODO** `(line 82)`  We might want to add an array of sites that a user is linked to
* **TODO** `(line 110)` , send out email with clear-text temp password

## app/views/index.html

* **TODO** `(line 23)`  need to add these files to bower-install grunt task somehow -->
* **TODO** `(line 83)`  need to add these files to bower-install grunt task somehow -->

## app/views/partials/metrics/metrics.html

* **TODO** `(line 23)` : Need to figure out why if we switch one different than the first one, that the first one switches.-->

## app/views/partials/statusPage.html

* **TODO** `(line 4)`  The data in the customize page needs to be confined to the specifications of the /customize changes. -->
* **TODO** `(line 15)`  If incident is resolved, don't show here -->
* **TODO** `(line 41)`  make sure we don't slice the values in production. Only good for testing. -->
* **TODO** `(line 42)`  if we want to add the y axis label again, use yAxisLabel="{{metric.suffix}}" -->
