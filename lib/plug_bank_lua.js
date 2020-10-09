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

/*                       Main Datastructures:
 *    GLOBAL:
 *        user:money-root-people (STREAM)
 *             -Log money balances over time with records of the form:
 *                {current: number, delta: number, reason: string=}
 *
 *        user:pool-root-people (STREAM)
 *             -Log changes in the pool size over time with records of the form:
 *                {current: number, delta: number, reason: string=}
 *
 *        user:money-nonces-root-people (MAP)
 *             -(source_CA -> nonce) To avoid duplicates from that source
 * by requiring a fresh nonce
 *
 *        user:pool-nonces-root-people (MAP)
 *             -(source_CA -> nonce) To avoid duplicates from that source
 * by requiring a fresh nonce
 *
 *
 */


/*
 * Updates an stream ignoring duplicates.
 *
 * Duplicates are detected based on current values, so it requires serialized
 *  replay, and may still accept rare duplicate sequences that end with the
 *  initial value. Not an issue with one update (!= 0) per message processed.
 *
 *  If this is not enough, the `reason` field could also include a unique id for
 *  post-processing filtering.
 *
 *
 * KEYS[1] stream name
 * KEYS[2] nonces map
 * ARGV[1] source
 * ARGV[2] delta
 * ARGV[3] reason
 * ARGV[4] nonce
 *
 */
/*eslint-disable */
const luaChange =
'local nonce = redis.call("hget", KEYS[2], ARGV[1]) \
 if nonce ~= ARGV[4] then \
   redis.call("hset", KEYS[2], ARGV[1], ARGV[4]) \
   local current = 0 \
   local last = redis.call("xrevrange", KEYS[1], "+", "-", "count",  1) \
   if #last == 1 then \
     current = tonumber(last[1][2][2]) + tonumber(last[1][2][4]); \
   end \
   redis.call("xadd", KEYS[1], "*", "current", tostring(current), "delta", ARGV[2], \
"reason", ARGV[3]) \
 end ';
/*eslint-enable*/

/*
 * Returns the current value of balance or pool size.
 *
 * KEYS[1] stream name
 *
 */
/*eslint-disable */
const luaSize =
'local current = 0 \
 local last = redis.call("xrevrange", KEYS[1], "+", "-", "count",  1) \
 if #last == 1 then \
    current = tonumber(last[1][2][2]) + tonumber(last[1][2][4]); \
 end \
 return tostring(current) \
';
/*eslint-enable*/

exports.luaAll = {
    changeBalance: luaChange,
    changePoolSize: luaChange, // same but different target stream
    getBalance: luaSize,
    getPoolSize: luaSize // same but different target stream
};
