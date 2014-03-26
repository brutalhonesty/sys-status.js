# Grunt TODO

## app/scripts/controllers/main.js

* **TODO** `(line 10)`  we could load some markup to say "Create a component now"
* **TODO** `(line 73)`  We would change this check to a for-loop and check for 'not completion' incase we flagged an incident instead of actually deleting it
* **TODO** `(line 80)`  Figure out how this changes when the data is repainted
* **TODO** `(line 122)`  Figure out a way to poll new metric data.
* **TODO** `(line 147)`  figure out how this changes when the data is repainted
* **TODO** `(line 304)`  and setup the function to do it as well
* **TODO** `(line 677)`  figure out why these are here
* **TODO** `(line 688)`  repaint the graph with new changes

## app/scripts/directives/main.js

* **TODO** `(line 4)`  we can make this more generalized
* **TODO** `(line 43)`  Figure out how to call a template, bring in as string and dump into page

## lib/controllers/company.js

* **TODO** `(line 40)`  We might want to return this key because you have to be authenticated to hit this API
* **TODO** `(line 51)`  Write getCompany() API call

## lib/controllers/components.js

* **TODO** `(line 55)` , when we update the status, we need to create a new incident if the status is not operational

## lib/controllers/customize.js

* **TODO** `(line 61)`  possibly check for 304 (Not Modified) as well
* **TODO** `(line 111)`  We might want to improve this some how. For now, we want the path only for unlinking the file when we are doing testing
* **TODO** `(line 205)`  We might want to improve this some how. For now, we want the path only for unlinking the file when we are doing testing
* **TODO** `(line 243)`  add session checking if wanted

## lib/controllers/maintenance.js

* **TODO** `(line 100)`  Trigger closing of any maintenance stuff that's still open for this maintenance incident
* **TODO** `(line 186)`  trigger events for boolean values and anything else we need to do to kick start the maintenance with new times.
* **TODO** `(line 313)`  Trigger events if remindSubs and/or setProgress is enabled.

## lib/controllers/metrics.js

* **TODO** `(line 235)` : X-axis is disabled from changing right now so it should also not be updated in DB either.
* **TODO** `(line 323)`  We might not want to truely delete a metric, we might just want to mark as deleted and continue to store for history purposes.

## lib/controllers/register.js

* **TODO** `(line 84)`  We might want to add an array of sites that a user is linked to

## lib/controllers/team.js

* **TODO** `(line 87)`  We might want to add an array of sites that a user is linked to
* **TODO** `(line 113)` , send out email with clear-text temp password

## test/node/mock/api.js

* **TODO** `(line 47)`  We should fix the callback hell (http://callbackhell.com/) in the mock testings.
* **TODO** `(line 514)`  We should mock this API call when it's completed.

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
