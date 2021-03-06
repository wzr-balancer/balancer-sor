import fetch from 'isomorphic-fetch';
import { SubGraphPools, Pools, Pool, Token } from './types';
import * as bmath from './bmath';
import axios from 'axios';

export class POOLS {
    async getAllPublicSwapPools(URL: string, useTheGraphQuerry:boolean=true): Promise<SubGraphPools> {
        if(!useTheGraphQuerry){
            const result = await fetch(URL);
            const allPools = result.json();
            return allPools;
        }else{
            try{
            //GraphQL query bsc_testnet            
                let result = await axios.post(URL, {
                    "query": "{ pools { id swapFee tokens { address balance decimals denormWeight } tokensList totalWeight } }",
                    "variables": null
                });                 
                //console.log(`=======>>>>${JSON.stringify(result.data)}`);
                return result.data.data;
            }catch(error){
                console.error(error)
            }        
        }
        
    }

    async formatPoolsBigNumber(pools: SubGraphPools): Promise<Pools> {
        let onChainPools: Pools = { pools: [] };

        for (let i = 0; i < pools.pools.length; i++) {
            let tokens: Token[] = [];

            let p: Pool = {
                id: pools.pools[i].id,
                swapFee: bmath.scale(bmath.bnum(pools.pools[i].swapFee), 18),
                totalWeight: bmath.scale(
                    bmath.bnum(pools.pools[i].totalWeight),
                    18
                ),
                tokens: tokens,
                tokensList: pools.pools[i].tokensList,
            };

            pools.pools[i].tokens.forEach(token => {
                let decimals = Number(token.decimals);

                p.tokens.push({
                    address: token.address,
                    balance: bmath.scale(bmath.bnum(token.balance), decimals),
                    decimals: decimals,
                    denormWeight: bmath.scale(
                        bmath.bnum(token.denormWeight),
                        18
                    ),
                });
            });
            onChainPools.pools.push(p);
        }

        return onChainPools;
    }
}
