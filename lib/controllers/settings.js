module.exports = {
	redis: {
		ip: '127.0.0.1',
		port: 6379
	},
  couchdb: {
    url: 'http://localhost:5984',
    users: 'sysstatus-users',
    metrics: 'sysstatus-metrics',
    sites: 'sysstatus-sites'
  },
	crypto: {
		salt: 'nW5TzoURGNEI10CQAhhlRM6al6gcPr3ACQsgU5V3HtlvFmafewfKo1A7udNffLMe'
	},
  cookie: {
    secret: 'UF!J^6T7f!SrNpJL551nGmQ8arorAscZHmRByeb3*M$EF2lV'
  }
};