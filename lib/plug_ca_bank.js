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
const myUtils = caf_comp.myUtils;
const genPlugCA = caf_comp.gen_plug_ca;
const json_rpc = require('caf_transport').json_rpc;

exports.newInstance = async function($, spec) {
    try {
        const that = genPlugCA.create($, spec);
        const source = $.ca.__ca_getName__();

        /*
         * The contents of this variable are always checkpointed before
         * any state externalization (see `gen_transactional`).
         */
        that.state = {}; // handleMethod:string

        const handleReply = function(id, data) {
            if (that.state.handleMethod) {
                /* Response processed in a separate transaction, i.e.,
                 using a fresh message */
                const m = json_rpc.systemRequest($.ca.__ca_getName__(),
                                                 that.state.handleMethod,
                                                 id, data);
                $.ca.__ca_process__(m, function(err) {
                    err && $.ca.$.log &&
                        $.ca.$.log.error('Got handler exception ' +
                                         myUtils.errToPrettyStr(err));
                });
            } else {
                const logMsg = 'Ignoring reply ' + JSON.stringify(data);
                $.ca.$.log && $.ca.$.log.trace(logMsg);
            }
        };

        const genericImpl = async function(methodName, id, argsArray) {
            const reply = [null];
            try {
                let method = $._.$.bank[methodName];
                reply[1] = await method.apply(method, argsArray);
            } catch (err) {
                reply[0] = err;
            }
            handleReply(id, reply);
            return [];
        };

        // transactional ops
        const target = {
            async changePoolSizeImpl(id, delta, reason) {
                return genericImpl('changePoolSize', id,
                                   [source, id, delta, reason]);
            },
            async changeBalanceImpl(id, delta, reason) {
                return genericImpl('changeBalance', id,
                                   [source, id, delta, reason]);
            },
            async setHandleReplyMethodImpl(methodName) {
                that.state.handleMethod = methodName;
                return [];
            }
        };

        that.__ca_setLogActionsTarget__(target);

        that.changeBalance = function(current, delta, reason) {
            const id = 'changeBalance_' + myUtils.uniqueId();
            that.__ca_lazyApply__('changeBalanceImpl', [id, delta, reason]);
            return id;
        };

        that.dirtyGetBalance = () => $._.$.bank.getBalance();

        that.changePoolSize = function(delta, reason) {
            const id = 'changePoolSize_' + myUtils.uniqueId();
            that.__ca_lazyApply__('changePoolSizeImpl', [id, delta, reason]);
            return id;
        };

        that.dirtyGetPoolSize = () => $._.$.bank.getPoolSize();

        that.setHandleReplyMethod = function(methodName) {
            that.__ca_lazyApply__('setHandleReplyMethodImpl', [methodName]);
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
