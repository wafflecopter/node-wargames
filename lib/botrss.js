var sys = require('sys'),
	fs = require('fs');
	request = require('request');
	htmlparser = require("htmlparser");

process.addListener('uncaughtException', function (err, stack) {
    console.log('Caught exception: ' + err);
    console.log(err.stack);
});

exports.doRSS = function (bot, settings, bitly) {
    var self = this;
	sys.puts("Checking RSS...");

	var handler = new htmlparser.RssHandler(function (error, dom) {
	    if (error)
	        sys.puts(error);
	    //else
	    //   sys.puts(dom);
	});

	request({'uri': settings.rssUrl}, function(err, res, body) {
		sys.puts("Parsing RSS result...");
		var parser = new htmlparser.Parser(handler);
		parser.parseComplete(body);
		//sys.puts(sys.inspect(handler.dom, false, null));
		Object.keys(handler.dom.items).reverse().forEach(function(item) {
			pubdate = new Date(handler.dom.items[item].pubDate).getTime();
			if (pubdate > settings.rssCounter) {
				bitly.shorten(handler.dom.items[item].link, function(result) {
					shortlink = result.data.url
					title = handler.dom.items[item].title;
					newmsg = '[git] ' + title + ' [' + shortlink + ']';
					sys.puts(newmsg + ' ' + new Date(pubdate));
					bot.say(settings.ircChannel, newmsg);
					settings.rssCounter = pubdate
				});
			}
		});
	});
}
