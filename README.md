Sys-Status
==========

An Open-Source Status Page Server/Interface

[![Build Status](https://travis-ci.org/brutalhonesty/sys-status.js.svg?branch=master)](https://travis-ci.org/brutalhonesty/sys-status.js)
[![Dependency Status](https://david-dm.org/brutalhonesty/sys-status.js.png)](https://david-dm.org/brutalhonesty/sys-status.js)
Version
-------
0.5

License
-------
[GPL v3](https://tldrlegal.com/license/gnu-general-public-license-v3-(gpl-3))


Dashboard
---------
![Screenshot of Dashboard](http://i.imgur.com/KpWhhC7.png)

Metrics
-------
![Screenshot of Example Metric](http://i.imgur.com/RFFJj8o.png)

Customization
--------------
![Screenshot of Customization](http://i.imgur.com/jo0BnFO.png)


TODO
----
Check out the markdown TODO [list](TODO.md)

Test
----
```bash
# Server-Side Testing
npm test
# Client-Side Testing (Still work in progress)
grunt build
```

Dependencies
------------
[NodeJS](http://nodejs.org/)
[Redis](http://redis.io/)
[CouchDB](http://couchdb.apache.org/)

Installation
------------

```bash
git clone <repo url>
cd /path/to/repo

# Start up DB and Session Store
couchdb
redis-server

# Install dependencies, database structure and upload folders
npm install

# Dependency resolution: http://i.imgur.com/BH9Fas6.png
bower install

# Development
grunt serve

# Edit settings and configs (depending on your environment)
vim lib/controllers/settings.js
vim lib/config/env/development.js
# or
vim lib/config/env/production.js

# Production
grunt
mv ./dist /path/to/production/location && cd /path/to/production/location

# Use Node to run
PORT=9000 node server.js

# Or use forever
PORT=9000 forever start server.js
```

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/brutalhonesty/sys-status.js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

