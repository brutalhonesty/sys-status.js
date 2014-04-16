TODO
====


* Admin page for status page
    * ~~Dashboard - Incident creater, Component status changer~~
    * ~~Incidents - Incident creater, scheduled maintenance creater, incident template creater~~
    * Components - ~~Component creater~~, 3rd party component creater (Github)
    * Metrics - ~~Metric creater~~, 3rd party data source, video walkthroughs
    * Customize page - ~~Layout & Design, Url~~, Custom CSS/HTML, Privacy
    * Notifications - ~~Check subscriber count, edit settings, FAQ~~
    * Team members - ~~Invite members~~
    * Integrations - Embed status in a page, Chat Ops 3rd Party integrations, ~~twitter integration~~, automate components
* Status page
    * ~~Title~~
    * Subscribe button
    * ~~Div status~~
    * ~~Singular Component operations~~
    * System Metrics (Day/Week/Month)
    * Past Incidents (10 days)
    * ~~History page link~~
* ~~History page~~
    * ~~Incidents by month~~

* ~~Migrate DB to CouchDB~~

* ~~Integrate Offline.JS~~
* ~~Integrate Favicon.JS~~

* Add mail service for sending out registration info to users

* ~~Migrate DB structure from user-centric to site-centric~~

* Check to make sure when an event is added or updated in the incident's object, the update time is changed.

* We can generalize all get requests to one function which checks the parameters to check what logic to execute. We can add checks to make sure requests for sensitive information will fail validation.
    * Example: ```/api/getData?request=customize,domain``` , returns an object with ```customize:{}``` and ```domain: ''```

* ~~Fix issue with modal not being displayed in production.~~
    * ~~https://github.com/angular-ui/bootstrap/issues/1947~~
    * ~~https://github.com/DaftMonk/generator-angular-fullstack/issues/135~~

Check out ```grep -R --exclude-dir=./app/bower_components --exclude-dir=node_modules 'TODO' .``` for more up to date list or see the [Grunt TODO list](grunt-TODO.md)