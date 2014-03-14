Grunt TODO
=========
* app/scripts/controllers/main.js:10 we could load some markup to say "Create a component now"
* app/scripts/controllers/main.js:72 figure out how this changes when the data is repainted
* app/scripts/controllers/main.js:114 figure out a way to poll new metric data.
* app/scripts/controllers/main.js:139 figure out how this changes when the data is repainted
* app/scripts/controllers/main.js:295 and setup the function to do it as well
* app/scripts/controllers/main.js:617 figure out why these are here
* app/scripts/controllers/main.js:628 repaint the graph with new changes
* app/scripts/directives/main.js:4 we can make this more generalized
* app/scripts/directives/main.js:43 Figure out how to call a template, bring in as string and dump into page
* lib/controllers/components.js:54, when we update the status, we need to create a new incident if the status is not operational
* lib/controllers/customize.js:59 possibly check for 304 (Not Modified) as well
* lib/controllers/customize.js:233 add session checking if wanted
* lib/controllers/maintenance.js:100 Trigger closing of any maintenance stuff that's still open for this maintenance incident
* lib/controllers/maintenance.js:186 trigger events for boolean values and anything else we need to do to kick start the maintenance with new times.
* lib/controllers/maintenance.js:317 trigger events if remindSubs and/or setProgress is enabled.
* lib/controllers/metrics.js:214 delete req.body.email client-side
* lib/controllers/metrics.js:238: X-axis is disabled from changing right now so it should also not be updated in DB either.
* lib/controllers/metrics.js:349 may some throttling to prevent bruteforce
* lib/controllers/metrics.js:364 may some throttling to prevent bruteforce
* app/views/index.html:22 need to add these files to bower-install grunt task somehow -->
* app/views/index.html:77 need to add these files to bower-install grunt task somehow -->
* app/views/partials/metrics/metrics.html:23: Need to figure out why if we switch one different than the first one, that the first one switches.-->
* app/views/partials/statusPage.html:13 If incident is resolved, don't show here -->
* app/views/partials/statusPage.html:39 make sure we don't slice the values in production. Only good for testing. -->
* app/views/partials/statusPage.html:40 if we want to add the y axis label again, use yAxisLabel="{{metric.suffix}}" -->

This file was auto-generated with the [Grunt TODO Generator](https://github.com/brutalhonesty/grunt-todo)
