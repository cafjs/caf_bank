'use strict';

/**
 *  Proxy that allows a CA to manage payment transactions.
 *
 * @module caf_bank/proxy_bank
 * @augments external:caf_components/gen_proxy
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genProxy = caf_comp.gen_proxy;

exports.newInstance = async function($, spec) {
    try {
        const that = genProxy.create($, spec);

        /**
         * Changes the balance with a deposit or withdrawal of money.
         *
         * @param {number} delta The amount to deposit (>0) or withdraw (<0)
         * @param {string} reason A reason for the change.
         *
         * @return {string} A unique id for this request.
         *
         * @memberof! module:caf_bank/proxy_bank#
         * @alias changeBalance
         */
        that.changeBalance = function(delta, reason) {
            return $._.changeBalance(delta, reason);
        };

        /**
         * Gets the current balance.
         *
         * @return {Promise<number>} Promise with the current balance.
         *
         * @memberof! module:caf_bank/proxy_bank#
         * @alias dirtyGetBalance
         */
        that.dirtyGetBalance = function() {
            return $._.dirtyGetBalance();
        };

        /**
         * Changes the size of the pool of units to be allocated.
         *
         * @param {number} delta The number of units to increase (>0) or
         * decrease (<0) the pool.
         * @param {string} reason The justification for the change.
         *
         * @return {string} A unique id for this request.
         *
         * @memberof! module:caf_bank/proxy_bank#
         * @alias changePoolSize
         */
        that.changePoolSize = function(delta, reason) {
            return $._.changePoolSize(delta, reason);
        };


        /**
         * Gets the number of units in the pool size.
         *
         * @return {Promise<number>} Promise with the number of units in the
         * pool size.
         *
         * @memberof! module:caf_bank/proxy_bank#
         * @alias dirtyGetPoolSize
         */
        that.dirtyGetPoolSize = function() {
            return $._.dirtyGetPoolSize();
        };

        /**
         * Sets the name of the method in this CA that will process
         * reply call messages.
         *
         * To ignore replies, just set it to `null` (the default).
         *
         * The type of the method is `async function(requestId, response)`
         *
         * where:
         *
         *  *  `requestId`: is an unique identifier to match the request.
         * The original method name invoked is a prefix in this id.
         *  *  `response` is a tuple using the standard  `[Error, number]`
         * CAF.js convention.
         *
         * @param {string| null} methodName The name of this CA's method that
         *  process replies.
         *
         * @memberof! module:caf_bank/proxy_bank#
         * @alias setHandleReplyMethod
         *
         */
        that.setHandleReplyMethod = function(methodName) {
            $._.setHandleReplyMethod(methodName);
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
