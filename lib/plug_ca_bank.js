'use strict';

/**
 * Manages payment transactions for this CA.
 *
 *
 * @module caf_bank/plug_ca_bank
 * @augments external:caf_components/gen_plug_ca
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genPlugCA = caf_comp.gen_plug_ca;
const json_rpc = require('caf_transport').json_rpc;

exports.newInstance = async function($, spec) {
    try {
        const that = genPlugCA.create($, spec);

        // cached values, assumes a single CA doing updates
        let balance = await $._.$.bank.getBalance();
        let poolSize = await $._.$.bank.getPoolSize();

        const owner = json_rpc.splitName($.ca.__ca_getName__())[0];

        const checkPrivileged = function() {
            if (owner !== 'root') {
                throw new Error('Not enough privileges to call this method');
            }
        };

        const genericImpl = async function(methodName, argsArray) {
            const reply = [null];
            try {
                let method = $._.$.bank[methodName];
                reply[1] = await method.apply(method, argsArray);
            } catch (err) {
                reply[0] = err;
            }
            return reply;
        };

        // transactional ops
        const target = {
            async changePoolSizeImpl(current, delta, reason) {
                return genericImpl('changePoolSize', [current, delta, reason]);
            },
            async changeBalanceImpl(current, delta, reason) {
                return genericImpl('changeBalance', [current, delta, reason]);
            }
        };

        that.__ca_setLogActionsTarget__(target);

        that.changeBalance = function(current, delta, reason) {
            checkPrivileged();
            if (delta && (balance === current)) {
                balance = balance + delta;
                that.__ca_lazyApply__('changeBalanceImpl', [current, delta,
                                                            reason]);
                return true;
            } else {
                return false;
            }
        };

        that.getBalance = () => balance;

        that.changePoolSize = function(current, delta, reason) {
            checkPrivileged();
            if (delta && (poolSize === current)) {
                poolSize = poolSize + delta;
                that.__ca_lazyApply__('changePoolSizeImpl', [current, delta,
                                                             reason]);
                return true;
            } else {
                return false;
            }
        };

        that.getPoolSize = () => poolSize;

        return [null, that];
    } catch (err) {
        return [err];
    }
};
