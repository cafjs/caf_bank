const caf_comp = require('caf_components');
const myUtils = caf_comp.myUtils;

const genComponent =  caf_comp.gen_component;
const util = require('util');

const setTimeoutPromise = util.promisify(setTimeout);

/**
 * Factory method to create a test component.
 *
 * @see supervisor
 */
exports.newInstance = async function($, spec) {
    try {
        const that = genComponent.create($, spec);
        const cp = 'cp';
        const source = 'foo-test1';

        that.changeBalance = async function(delta, reason) {
            const nonce = 'changeBalance_' + myUtils.uniqueId();
            await $._.$[cp].changeBalance(source, nonce, delta, reason);
            return [];
        };

        that.changePoolSize = async function(delta, reason) {
            const nonce = 'changePoolSize_' + myUtils.uniqueId();
            await $._.$[cp].changePoolSize(source, nonce, delta, reason);
            return [];
        };

        that.getBalance = async function() {
            const current = await $._.$[cp].getBalance();
            return [null, current];
        };

        that.getPoolSize = async function() {
            const current = await $._.$[cp].getPoolSize();
            return [null, current];
        };

        return [null, that];
    } catch (err) {
        console.log('got err' + err);
        return [err];
    }
};
