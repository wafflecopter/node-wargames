var sys = require('sys'),
	fs = require('fs'),
	request = require('request'),
	htmlparser = require("htmlparser");
	url = require("url"),
	http = require("http");

process.addListener('uncaughtException', function (err, stack) {
	console.log('Caught exception: ' + err);
	console.log(err.stack);
});


function BotRSS(rssFeed) {
	process.EventEmitter.call(this);
	var self = this;

	var handler = new htmlparser.RssHandler(function (error, dom) {
		if (error)
			sys.puts(error);
		//else
		//   sys.puts(dom);
	});
	var parser = new htmlparser.Parser(handler);

	// create client object for request module
	rssFeed.urlObj = url.parse(rssFeed.url);
	var secure = false;
	if(rssFeed.urlObj.protocol == 'https:') {
		if(!rssFeed.urlObj.port) { rssFeed.urlObj.port = 443; }
		secure = true;
	} else {
		if(!rssFeed.urlObj.port) { rssFeed.urlObj.port = 80; }
		secure = false;
	}
	rssFeed.client = http.createClient(rssFeed.urlObj.port, rssFeed.urlObj.hostname, secure);

	setInterval(function() {
		if(typeof(rssFeed.lastCheck) == 'undefined')
			rssFeed.lastCheck = new Date().getTime();
		now = new Date().getTime();
		if(now > rssFeed.lastCheck + rssFeed.interval) {
			sys.log('Checking feed: ' + rssFeed.name);
			request({'uri': rssFeed.urlObj, 'client': rssFeed.client},
				function(err, res, body) {
				sys.log('Got response for feed: ' + rssFeed.name);
				parser.parseComplete(body);
				//sys.puts(sys.inspect(handler.dom, false, null));
				if(typeof(handler.dom.items) == 'undefined') {
					console.log('%s; had trouble fetching/parsing', rssFeed.name);
					delete rssFeed.client;
					rssFeed.client = http.createClient(rssFeed.urlObj.port, rssFeed.urlObj.hostname, secure);
				} else {
					sys.log('Emitting items for feed: ' + rssFeed.name);
					Object.keys(handler.dom.items).reverse().forEach(function(item) {
						//console.log('emitting' + handler.dom.items[item]);
						self.emit('rssitem', handler.dom.items[item]);
					});
				}
			});
			rssFeed.lastCheck = now;
		}
	}, 10*1000, this);
}

sys.inherits(BotRSS, process.EventEmitter);

module.exports = BotRSS;


