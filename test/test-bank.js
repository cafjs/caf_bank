var hello = require('./hello/main.js');
var caf_comp = require('caf_components');
var async = caf_comp.async;
var myUtils = caf_comp.myUtils;
var util = require('util');

process.on('uncaughtException', function (err) {
    console.log("Uncaught Exception: " + err);
    console.log(err.stack);
    //console.log(myUtils.errToPrettyStr(err));
    process.exit(1);

});

var setTimeoutAsync = util.promisify(setTimeout);


var appName = 'foo-test' + myUtils.uniqueId();

module.exports = {
    setUp: function (cb) {
        var self = this;
        hello.load(null, {env : {appName: appName}}, 'helloBank.json', null,
                   function(err, $) {
                       self.$ = $;
                       cb(err, $);
                   });
    },

    tearDown: function (cb) {
        this.$.topRedis.__ca_shutdown__(null, cb);
    },

    helloworld: async function (test) {
        var self = this;
        test.expect(4);
        try {
            const [err, initB] = await this.$._.$.bank.getBalance();
            console.log(initB);
            test.ok(initB === 0);
            const [err2, initP] = await this.$._.$.bank.getPoolSize();
            test.ok(initP === 0);

            await this.$._.$.bank.changePoolSize(3, 't1');
            await this.$._.$.bank.changePoolSize(5, 't2');
            const [err4, pool] = await this.$._.$.bank.getPoolSize();

            test.ok(pool === 8);

            await this.$._.$.bank.changeBalance(30.3, 't11');
            await this.$._.$.bank.changeBalance(-1.3, 't21');

            const [err3, bal] = await this.$._.$.bank.getBalance();
            console.log(bal);
            test.ok(bal === 29);

            test.done();
        } catch (err) {
            test.ifError(err);
            test.done();
        }

    }


};
