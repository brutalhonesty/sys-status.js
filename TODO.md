TODO
====


* Admin page for status page
    * Dashboard - Incident creater, Component status changer
    * Incidents - Incident creater, scheduled maintenance creater, incidient template creater
    * Components - Component creater, 3rd party component creater (Github)
    * Metrics - Metric creater, 3rd party data source, video walkthroughs
    * Customize page - Layout & Design, Url, Custom CSS/HTML, Privacy
    * Notifications - Check subscriber count, edit settings, FAQ
    * Team members - Invite members
    * Integrations - Embed status in a page, Chat Ops 3rd Party integrations, twitter integration, automate components
* Status page
    * Title
    * Subscribe button
    * Div status
    * Singular Component operations
    * System Metrics (Day/Week/Month)
    * Past Incidents (10 days)
    * History page link
* History page
    * Incidents by month


Check out ```grep -R --exclude-dir=./app/bower_components --exclude-dir=node_modules 'TODO' .``` for more up to date list.

* Check to make sure when an event is added or updated in the incident's object, the update time is changed.
* Maintenance.js:~94 Trigger closing of any maintenance stuff that's still open for this maintenance incident
* Maintenance.js:~298 Trigger events if remindSubs and/or setProgress is enabled.
* Maintenance.js:~176 Trigger events for boolean values and anything else we need to do to kick start the maintenance with new times.