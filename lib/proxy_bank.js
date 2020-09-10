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
         * If the `current` balance does not match the actual balance it is
         * assumed that it is a duplicate and ignored.
         *
         * @param {number} current The current balance.
         * @param {number} delta The amount to deposit (>0) or withdraw (<0)
         * @param {string} reason A reason for the change.
         *
         * @return {boolean} `True` if it was ignored.
         *
         * @throws Error if the caller is not privileged.
         *
         * @memberof! module:caf_bank/proxy_bank#
         * @alias changeBalance
         */
        that.changeBalance = function(current, delta, reason) {
            return $._.changeBalance(current, delta, reason);
        };

        /**
         * Gets the current balance.
         *
         * @throws Error if the caller is not privileged.
         *
         * @memberof! module:caf_bank/proxy_bank#
         * @alias getBalance
         */
        that.getBalance = function() {
            return $._.getBalance();
        };

        /**
         * Changes the size of the pool of units to be allocated.
         *
         * If the `current` pool size does not match the actual size it is
         * assumed that it is a duplicate and ignored.
         *
         * @param {number} current The current size of the pool.
         * @param {number} delta The number of units to increase (>0) or
         * decrease (<0) the pool.
         * @param {string} reason The justification for the change.
         *
         * @return {boolean} The previous number of units in the pool size.
         *
         * @throws Error if the caller is not privileged.
         *
         * @memberof! module:caf_bank/proxy_bank#
         * @alias changePoolSize
         */
        that.changePoolSize = function(current, delta, reason) {
            return $._.changePoolSize(current, delta, reason);
        };


        /**
         * Gets the number of units in the pool size.
         *
         * @return {number} The number of units in the pool size.
         *
         * @throws Error if the caller is not privileged.
         *
         * @memberof! module:caf_bank/proxy_bank#
         * @alias getPoolSize
         */
        that.getPoolSize = function() {
            return $._.getPoolSize();
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
