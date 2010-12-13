var sys = require('sys'),
	Client = require('mysql').Client;

process.addListener('uncaughtException', function (err, stack) {
	console.log('Caught exception: ' + err);
	console.log(err.stack);
});

function LearnDB(bot, settings) {
	var self = this;

	self.bot = bot;
	self.settings = settings;
	self.client = new Client();
	self.client.database = self.settings.ldbname;
	self.client.table = self.settings.ldbtable;
	self.client.user = self.settings.ldbuser;
	self.client.password = self.settings.ldbpass;
	self.client.connect();
	self.client.query('USE '+ self.settings.ldbname);

	self.doit();
};

LearnDB.prototype.doit = function () {
	var self = this;

	self.bot.addListener('message', function (from, to, message) {
		sys.puts(from+' '+to+' '+message);

		pat_rape = new RegExp('.*rape.*');
		pat_learn = new RegExp('^!learn (.*) (.*)');
		pat_show = new RegExp('\\?\\? (.*)');

		if(message.match(pat_rape)) {
			self.bot.say(self.settings.ircChannel, 'gleam sux');
		}

		if(match = message.match(pat_show)) {
			self.client.query(
				'SELECT def FROM '+self.settings.ldbtable+
				' WHERE word = ?', [match[1],],
				function selectCb(err, results, fields) {
					if (err) {
						throw err;
					}
					console.log(results);
					console.log(fields);
			});

			self.bot.say(self.settings.ircChannel, 'whatever');
		}

/*        if(match = message.match(pat_learn)) {
			// check if exists
			self.ldb.get(match[1], function (err, doc, key) {
				if (doc) {
					self.bot.say(self.settings.ircChannel,
								match[1] + ' already exists!');
				} else {
					// save
					sys.puts('dongs');
					self.ldb.save(match[1], {def: match[2]
											, author: from
											, date: new Date().getTime()},
											function (err, key) {
						if (err) { throw err; }
						self.bot.say(self.settings.ircChannel,
									'Added ' + match[1]);
					});
				}
			});
		}*/
	});
};

module.exports = LearnDB;
