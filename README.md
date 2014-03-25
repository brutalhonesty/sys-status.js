Sys-Status
==========

An Open-Source Status Page Server/Interface

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

Installation
------------

```bash
git clone <repo url>
cd /path/to/repo
npm install
bower install
# Development
grunt serve
# Edit settings and config
vim lib/controllers/settings.js
vim lib/config/config.js
# Production
grunt
mv ./dist /path/to/production/location
```