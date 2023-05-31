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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenMetadata = exports.fetchTokenList = exports.WALLETSOLIDITY = exports.WALLET = exports.NILE_TOKEN_END_POINT_API = exports.TRONGRID_TOKEN_END_POINT_API = exports.MAINNET_TOKEN_END_POINT_API = exports.TOKEN_METADATA_NO_SUPPORT_ERROR = exports.TOKEN_END_POINT_API = void 0;
const controller_utils_1 = require("@metamask/controller-utils");
const assetsUtil_1 = require("./assetsUtil");
exports.TOKEN_END_POINT_API = 'https://token-api.metaswap.codefi.network';
exports.TOKEN_METADATA_NO_SUPPORT_ERROR = 'TokenService Error: Network does not support fetchTokenMetadata';
// Tron token URL
exports.MAINNET_TOKEN_END_POINT_API = 'https://api.trongrid.io';
exports.TRONGRID_TOKEN_END_POINT_API = 'https://api.shasta.trongrid.io';
exports.NILE_TOKEN_END_POINT_API = 'https://nile.trongrid.io';
exports.WALLET = 'wallet';
exports.WALLETSOLIDITY = 'walletsolidity';
function getTronENDPOINTAPI(chainId) {
    let url = exports.TRONGRID_TOKEN_END_POINT_API;
    // switch (chainId) {
    //   case NetworksChainId.TronMainet:
    //     url = MAINNET_TOKEN_END_POINT_API;
    //     break;
    //   case NetworksChainId.TronGrid:
    //     url = TRONGRID_TOKEN_END_POINT_API;
    //     break;
    //   case NetworksChainId.TronNile:
    //     url = NILE_TOKEN_END_POINT_API;
    //     break;
    // }
    return url;
}
function isETHNetwork(chainId) {
    return chainId < '990';
}
/**
 * Get the tokens URL for a specific network.
 *
 * @param chainId - The chain ID of the network the tokens requested are on.
 * @returns The tokens URL.
 */
function getTokensURL(chainId) {
    return isETHNetwork(chainId)
        ? `${exports.TOKEN_END_POINT_API}/tokens/${chainId}`
        : `${getTronENDPOINTAPI(chainId)}/${exports.WALLET}/getassetissuelist`;
}
/**
 * Get the token metadata URL for the given network and token.
 *
 * @param chainId - The chain ID of the network the token is on.
 * @param tokenAddress - The token address.
 * @returns The token metadata URL.
 */
function getTokenMetadataURL(chainId, tokenAddress) {
    return isETHNetwork(chainId)
        ? `${exports.TOKEN_END_POINT_API}/token/${chainId}?address=${tokenAddress}`
        : `${getTronENDPOINTAPI(chainId)}/${exports.WALLETSOLIDITY}/getassetissuebyname?value=${tokenAddress}`;
}
const tenSecondsInMilliseconds = 10000;
// Token list averages 1.6 MB in size
// timeoutFetch by default has a 500ms timeout, which will almost always timeout given the response size.
const defaultTimeout = tenSecondsInMilliseconds;
/**
 * Fetch the list of token metadata for a given network. This request is cancellable using the
 * abort signal passed in.
 *
 * @param chainId - The chain ID of the network the requested tokens are on.
 * @param abortSignal - The abort signal used to cancel the request if necessary.
 * @param options - Additional fetch options.
 * @param options.timeout - The fetch timeout.
 * @returns The token list, or `undefined` if the request was cancelled.
 */
function fetchTokenList(chainId, abortSignal, { timeout = defaultTimeout } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenURL = getTokensURL(chainId);
        console.log('#### tokenURL: ', tokenURL);
        const response = yield queryApi(tokenURL, abortSignal, timeout);
        return [
            {
                address: '416b1171698969a36e5eb2eb6ea7aa9204d5e10cfc',
                name: '!!!!GOLDCOIN',
                // abbr: 'GOLD',
                symbol: 'GOLD',
                iconUrl: 'https://goldchain.xyz',
                aggregators: [
                    'Aave',
                    'Bancor',
                    'CMC',
                    'Crypto.com',
                    'CoinGecko',
                    '1inch',
                    'PMM',
                    'Synthetix',
                    'Zerion',
                    'Lifi',
                ],
                occurrences: 10,
                decimals: 18,
                fees: {
                    '0xda4ef8520b1a57d7d63f1e249606d1a459698876': 0,
                    '0x5fd79d46eba7f351fe49bff9e87cdea6c821ef9f': 0,
                },
                type: 'erc20',
                url: 'https://goldchain.xyz',
                // chainId: '999',
                // aggregators: ['TraderJoe'],
                // // owner_address: '416b1171698969a36e5eb2eb6ea7aa9204d5e10cfc',
                // address: '416b1171698969a36e5eb2eb6ea7aa9204d5e10cfc',
                // name: '!!!!GOLDCOIN',
                // // abbr: 'GOLD',
                // symbol: 'GOLD',
                // total_supply: 9000000000000000000,
                // trx_num: 1000000,
                // num: 1000,
                // start_time: 1556094180182,
                // end_time: 1871799840182,
                // description: 'GOLD',
                // url: 'https://goldchain.xyz',
                // id: '1002341',
            },
            {
                chainId: '999',
                address: '418f82a73b283c7bf8515fa3cc2c0399d4d593e2e3',
                name: '!!!!GoldSpot!!!!',
                // abbr: 'GOLD',
                symbol: 'Gold',
                iconUrl: 'www.goldspot.eu',
                occurrences: 3,
                decimals: 18,
                aggregators: [
                    'Aave',
                    'Bancor',
                    'CMC',
                    'Crypto.com',
                    'CoinGecko',
                    '1inch',
                    'PMM',
                    'Synthetix',
                    'Zerion',
                    'Lifi',
                ],
                fees: {},
                type: 'erc20',
                url: 'www.goldspot.eu',
                description: 'GoldSpot follow the price of gold in the blockchain!!! Owners will get AGS (aGoldSpot) drop monthly. GoldSpot will be upgraded to a trc20 in 2020. Invest in the gold market!!! Global Gold Traders!!',
                // chainId: '999',
                // aggregators: ['TraderJoe'],
                // address: '418f82a73b283c7bf8515fa3cc2c0399d4d593e2e3',
                // name: '!!!!GoldSpot!!!!',
                // symbol: 'Gold',
                // total_supply: 99000000000,
                // frozen_supply: [[Object]],
                // trx_num: 1000000,
                // num: 100,
                // start_time: 1559106000646,
                // end_time: 1609451940646,
                // url: 'www.goldspot.eu',
                // id: '1002467',
            },
        ];
        // if (response) {
        //   return parseJsonResponse(response);
        // }
        // return undefined;
    });
}
exports.fetchTokenList = fetchTokenList;
/**
 * Fetch metadata for the token address provided for a given network. This request is cancellable
 * using the abort signal passed in.
 *
 * @param chainId - The chain ID of the network the token is on.
 * @param tokenAddress - The address of the token to fetch metadata for.
 * @param abortSignal - The abort signal used to cancel the request if necessary.
 * @param options - Additional fetch options.
 * @param options.timeout - The fetch timeout.
 * @returns The token metadata, or `undefined` if the request was either aborted or failed.
 */
function fetchTokenMetadata(chainId, tokenAddress, abortSignal, { timeout = defaultTimeout } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(0, assetsUtil_1.isTokenListSupportedForNetwork)(chainId)) {
            throw new Error(exports.TOKEN_METADATA_NO_SUPPORT_ERROR);
        }
        const tokenMetadataURL = getTokenMetadataURL(chainId, tokenAddress);
        const response = yield queryApi(tokenMetadataURL, abortSignal, timeout);
        if (response) {
            return parseJsonResponse(response);
        }
        return undefined;
    });
}
exports.fetchTokenMetadata = fetchTokenMetadata;
/**
 * Perform fetch request against the api.
 *
 * @param apiURL - The URL of the API to fetch.
 * @param abortSignal - The abort signal used to cancel the request if necessary.
 * @param timeout - The fetch timeout.
 * @returns Promise resolving request response.
 */
function queryApi(apiURL, abortSignal, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetchOptions = {
            referrer: apiURL,
            referrerPolicy: 'no-referrer-when-downgrade',
            method: 'GET',
            mode: 'cors',
            signal: abortSignal,
            cache: 'default',
        };
        fetchOptions.headers = new window.Headers();
        fetchOptions.headers.set('Content-Type', 'application/json');
        try {
            return yield (0, controller_utils_1.timeoutFetch)(apiURL, fetchOptions, timeout);
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Request is aborted');
            }
        }
        return undefined;
    });
}
/**
 * Parse an API response and return the response JSON data.
 *
 * @param apiResponse - The API response to parse.
 * @returns The response JSON data.
 * @throws Will throw if the response includes an error.
 */
function parseJsonResponse(apiResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        const responseObj = yield apiResponse.json();
        // api may return errors as json without setting an error http status code
        if (responseObj === null || responseObj === void 0 ? void 0 : responseObj.error) {
            throw new Error(`TokenService Error: ${responseObj.error}`);
        }
        return responseObj;
    });
}
//# sourceMappingURL=token-service.js.map