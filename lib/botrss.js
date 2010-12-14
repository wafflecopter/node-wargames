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
	//rssfeed.lastPub = 1292177518000;

	setInterval(function() {
		now = new Date().getTime();
		if(now > rssfeed.lastCheck + rssfeed.interval) {

			console.log("Checking %s feed", rssfeed.name);
			console.log(JSON.stringify(rssfeed));

			request({'uri': rssfeed.url}, function(err, res, body) {
				var parser = new htmlparser.Parser(handler);
				parser.parseComplete(body);
				//sys.puts(sys.inspect(handler.dom, false, null));
				Object.keys(handler.dom.items).reverse().forEach(function(item) {
					pubdate = new Date(handler.dom.items[item].pubDate).getTime();
					console.log('Dealing with item of pubdate: ' + pubdate);
					console.log('This feed\'s last pub: ' + rssfeed.lastPub);
					if (pubdate > rssfeed.lastPub) {
						bitly.shorten(handler.dom.items[item].link, function(result) {
							title = handler.dom.items[item].title;
							shortlink = result.data.url
							newmsg = '['+rssfeed.name+'] ' + title
							pat_twit = new RegExp('.*twitter.com.*');
							if (!rssfeed.url.match(pat_twit))
								newmsg += ' :: '+shortlink;
							sys.puts(newmsg + ' <-' + new Date(pubdate));
							bot.say(settings.ircChannel, newmsg);
							rssfeed.lastPub = pubdate
						});
					}
				});
			});
			rssfeed.lastCheck = new Date().getTime();
		}
}, 10*1000);

}

module.exports=BotRSS
