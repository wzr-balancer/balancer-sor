"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const isomorphic_fetch_1 = __importDefault(require("isomorphic-fetch"));
const bmath = __importStar(require("./bmath"));
const axios_1 = __importDefault(require("axios"));
class POOLS {
    getAllPublicSwapPools(URL, useTheGraphQuerry = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!useTheGraphQuerry) {
                const result = yield isomorphic_fetch_1.default(URL);
                const allPools = result.json();
                return allPools;
            }
            else {
                try {
                    //GraphQL query bsc_testnet            
                    let result = yield axios_1.default.post(URL, {
                        "query": "{ pools { id swapFee tokens { address balance decimals denormWeight } tokensList totalWeight } }",
                        "variables": null
                    });
                    //console.log(`=======>>>>${JSON.stringify(result.data)}`);
                    return result.data.data;
                }
                catch (error) {
                    console.error(error);
                }
            }
        });
    }
    formatPoolsBigNumber(pools) {
        return __awaiter(this, void 0, void 0, function* () {
            let onChainPools = { pools: [] };
            for (let i = 0; i < pools.pools.length; i++) {
                let tokens = [];
                let p = {
                    id: pools.pools[i].id,
                    swapFee: bmath.scale(bmath.bnum(pools.pools[i].swapFee), 18),
                    totalWeight: bmath.scale(bmath.bnum(pools.pools[i].totalWeight), 18),
                    tokens: tokens,
                    tokensList: pools.pools[i].tokensList,
                };
                pools.pools[i].tokens.forEach(token => {
                    let decimals = Number(token.decimals);
                    p.tokens.push({
                        address: token.address,
                        balance: bmath.scale(bmath.bnum(token.balance), decimals),
                        decimals: decimals,
                        denormWeight: bmath.scale(bmath.bnum(token.denormWeight), 18),
                    });
                });
                onChainPools.pools.push(p);
            }
            return onChainPools;
        });
    }
}
exports.POOLS = POOLS;
