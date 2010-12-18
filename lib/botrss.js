var sys = require('sys'),
	fs = require('fs'),
	request = require('request'),
	htmlparser = require("htmlparser");

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

	setInterval(function() {
		if(typeof(rssFeed.lastCheck) == 'undefined')
			rssFeed.lastCheck = new Date().getTime();
		now = new Date().getTime();
		if(now > rssFeed.lastCheck + rssFeed.interval) {
			console.log("Checking feed: " + JSON.stringify(rssFeed));
			request({'uri': rssFeed.url}, function(err, res, body) {
				var parser = new htmlparser.Parser(handler);
				parser.parseComplete(body);
				//sys.puts(sys.inspect(handler.dom, false, null));
				if(typeof(handler.dom.items) == 'undefined') {
					console.log('%s; had trouble fetching/parsing', rssFeed.name);
				} else {
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


