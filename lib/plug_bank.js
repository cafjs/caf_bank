/*!
Copyright 2020 Caf.js Labs and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
/**
 * A plug to manage payment transactions.
 *
 * @module caf_bank/plug_bank
 * @augments module:caf_redis/gen_redis_plug
 */
// @ts-ignore: augments not attached to a class

const assert = require('assert');
const util = require('util');
const genRedisPlug = require('caf_redis').gen_redis_plug;
const json_rpc = require('caf_transport').json_rpc;
const luaAll = require('./plug_bank_lua').luaAll;

const USER_PREFIX = 'bank:';
const MONEY_STREAM = USER_PREFIX + 'money';
const POOL_STREAM = USER_PREFIX + 'pool';
const MONEY_NONCES_MAP = MONEY_STREAM + '-nonces';
const POOL_NONCES_MAP = POOL_STREAM + '-nonces';

// See `plug_bank_lua` for a description of the main Redis datastructures.
exports.newInstance = async function($, spec) {
    try {
        $._.$.log && $._.$.log.debug('New Bank plug');

        const that = genRedisPlug.create($, spec);

        const appName = ($._.__ca_getAppName__ && $._.__ca_getAppName__()) ||
                spec.env.appName;

        assert.equal(typeof(appName), 'string', "'appName' is not a string");

        const moneyStream = json_rpc.joinName(MONEY_STREAM, appName);
        const poolStream = json_rpc.joinName(POOL_STREAM, appName);

        const moneyNoncesMap = json_rpc.joinName(MONEY_NONCES_MAP, appName);
        const poolNoncesMap = json_rpc.joinName(POOL_NONCES_MAP, appName);


        const doLuaAsync = util.promisify(that.__ca_doLuaOp__);
        const initClientAsync = util.promisify(that.__ca_initClient__);

        that.changeBalance = (source, nonce, delta, reason) =>
            doLuaAsync('changeBalance', [
                moneyStream,
                moneyNoncesMap
            ], [source, delta, reason, nonce]);

        that.changePoolSize = (source, nonce, delta, reason) =>
            doLuaAsync('changePoolSize', [
                poolStream,
                poolNoncesMap
            ], [source, delta, reason, nonce]);

        that.getBalance = async () => {
            const res = await doLuaAsync('getBalance', [
                moneyStream
            ], []);
            return parseFloat(res);
        };

        that.getPoolSize = async () => {
            const res = await doLuaAsync('getPoolSize', [
                poolStream
            ], []);
            return parseFloat(res);
        };

        const dynamicServiceConfig = $._.$.paas &&
            $._.$.paas.getServiceConfig(spec.env.paas) || null;
        await initClientAsync(dynamicServiceConfig, luaAll, null);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
