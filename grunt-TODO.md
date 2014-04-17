# Grunt TODO

## app/scripts/controllers/main.js

* **TODO** `(line 94)`  Figure out how this changes when the data is repainted
* **TODO** `(line 136)`  Figure out a way to poll new metric data.
* **TODO** `(line 161)`  figure out how this changes when the data is repainted
* **TODO** `(line 362)`  and setup the function to do it as well
* **TODO** `(line 819)`  figure out why these are here
* **TODO** `(line 830)`  repaint the graph with new changes
* **TODO** `(line 1111)`  We need to allow users to add their own public key into the OAuth.intialize() call.

## app/scripts/directives/main.js

* **TODO** `(line 4)`  we can make this more generalized
* **TODO** `(line 43)`  Figure out how to call a template, bring in as string and dump into page

## lib/controllers/company.js

* **TODO** `(line 41)`  We might want to return this key because you have to be authenticated to hit this API
* **TODO** `(line 81)`  We might want to return this key because you have to be authenticated to hit this API

## lib/controllers/components.js

* **TODO** `(line 99)` , when we update the status, we need to create a new incident if the status is not operational

## lib/controllers/customize.js

* **TODO** `(line 110)`  We might want to improve this some how. For now, we want the path only for unlinking the file when we are doing testing
* **TODO** `(line 204)`  We might want to improve this some how. For now, we want the path only for unlinking the file when we are doing testing

## lib/controllers/incidents.js

* **TODO** `(line 103)`  if we have sub-domains, this siteurl might change and we need to account for that.
* **TODO** `(line 354)`  We might want to add an option to allow users to delete the tweet associated with it as well.

## lib/controllers/maintenance.js

* **TODO** `(line 100)`  Trigger closing of any maintenance stuff that's still open for this maintenance incident
* **TODO** `(line 186)`  trigger events for boolean values and anything else we need to do to kick start the maintenance with new times.
* **TODO** `(line 313)`  Trigger events if remindSubs and/or setProgress is enabled.

## lib/controllers/metrics.js

* **TODO** `(line 235)` : X-axis is disabled from changing right now so it should also not be updated in DB either.
* **TODO** `(line 323)`  We might not want to truely delete a metric, we might just want to mark as deleted and continue to store for history purposes.

## lib/controllers/team.js

* **TODO** `(line 17)`  This template file could look nicer. The HTML looks tacky, even for my standards :).
* **TODO** `(line 130)`  We might want to add an array of sites that a user is linked to
* **TODO** `(line 217)`  If we delete the owner, a new owner must be specified to take over the site.

## lib/controllers/users.js

* **TODO** `(line 89)`  We might want to add an array of sites that a user is linked to

## test/node/mock/api.js

* **TODO** `(line 110)`  We should fix the callback hell (http://callbackhell.com/) in the mock testings.
* **TODO** `(line 1137)`  Cannot test 'addMember; because we send an email out.

## app/views/partials/statusPage.html

* **TODO** `(line 4)`  The data in the customize page needs to be confined to the specifications of the /customize changes. -->
* **TODO** `(line 15)`  If incident is resolved, don't show here -->
* **TODO** `(line 41)`  make sure we don't slice the values in production. Only good for testing. -->
* **TODO** `(line 42)`  if we want to add the y axis label again, use yAxisLabel="{{metric.suffix}}" -->

## bower.json

* **TODO** `(line 64)`  need to wait for offlinejs to change their repo to use non-minified for main property before we can change ours.",
