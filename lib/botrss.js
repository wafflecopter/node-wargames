var sys = require('sys'),
	fs = require('fs');
	request = require('request');
	htmlparser = require("htmlparser");

process.addListener('uncaughtException', function (err, stack) {
	console.log('Caught exception: ' + err);
	console.log(err.stack);
});

function BotRSS(bot, bitly, rssfeed, settings) {

	var handler = new htmlparser.RssHandler(function (error, dom) {
		if (error)
			sys.puts(error);
		//else
		//   sys.puts(dom);
	});

	rssfeed.lastCheck = new Date().getTime();
	rssfeed.lastPub = new Date().getTime();
	rssfeed.lastPub = 1292000227000;

	setInterval(function() {
		now = new Date().getTime();
		if(now > rssfeed.lastCheck + rssfeed.interval) {

			console.log("Checking feed %s", rssfeed.name);

			request({'uri': rssfeed.url}, function(err, res, body) {
				var parser = new htmlparser.Parser(handler);
				parser.parseComplete(body);
				//sys.puts(sys.inspect(handler.dom, false, null));
				Object.keys(handler.dom.items).reverse().forEach(function(item) {
					pubdate = new Date(handler.dom.items[item].pubDate).getTime();
					if (pubdate > rssfeed.lastPub) {
						title = handler.dom.items[item].title;
						newmsg = '['+rssfeed.name+'] ' + title
						if (rssfeed.name == "twitter") {
							sys.puts(newmsg + ' <-' + new Date(pubdate));
							bot.say(settings.ircChannel, newmsg);
							rssfeed.lastPub = pubdate
						} else {
							bitly.shorten(handler.dom.items[item].link, function(result) {
								shortlink = result.data.url
								newmsg += ' ['+shortlink+']';
								sys.puts(newmsg + ' <-' + new Date(pubdate));
								bot.say(settings.ircChannel, newmsg);
								rssfeed.lastPub = pubdate
							});
						}
					}
				});
			});
			rssfeed.lastCheck = new Date().getTime();
		}
}, 60*1000);

}

module.exports=BotRSS
