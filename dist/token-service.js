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
        return listTronToken;
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
const listTronToken = [
    {
        symbol: 'USDC',
        address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
        chainId: 999,
        decimals: 6,
        name: 'USD Coin',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/upload/logo/TEkxiTehnzSmSe2XqrBj4w32RUN966rdz81.png',
    },
    {
        symbol: 'SUN',
        address: 'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S',
        chainId: 999,
        decimals: 18,
        name: 'SUN',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S.png',
    },
    {
        symbol: 'BTT',
        address: 'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4',
        chainId: 999,
        decimals: 18,
        name: 'BitTorrent',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/1002000.png',
    },
    {
        symbol: 'SUNOLD',
        address: 'TKkeiboTkxXKJpbmVFbv4a8ov5rAfRDMf9',
        chainId: 999,
        decimals: 18,
        name: 'SUNOLD',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/SUNLogo.178d4636.png',
    },
    {
        symbol: 'NFT',
        address: 'TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq',
        chainId: 999,
        decimals: 6,
        name: 'APENFT',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/upload/logo/TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq.png',
    },
    {
        symbol: 'BTC',
        address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
        chainId: 999,
        decimals: 8,
        name: 'Bitcoin',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9.png',
    },
    {
        symbol: 'WBTC',
        address: 'TXpw8XeWYeTUd4quDskoUqeQPowRh4jY65',
        chainId: 999,
        decimals: 8,
        name: 'Wrapped BTC',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/TXpw8XeWYeTUd4quDskoUqeQPowRh4jY65.png',
    },
    {
        symbol: 'ETH',
        address: 'THb4CqiFdwNHsWsQCs4JhzwjMWys4aqCbF',
        chainId: 999,
        decimals: 18,
        name: 'Ethereum',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/THb4CqiFdwNHsWsQCs4JhzwjMWys4aqCbF.png',
    },
    {
        symbol: 'WETH',
        address: 'TXWkP3jLBqRGojUih1ShzNyDaN5Csnebok',
        chainId: 999,
        decimals: 18,
        name: 'Wrapped ETH',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/TXWkP3jLBqRGojUih1ShzNyDaN5Csnebok.png',
    },
    {
        symbol: 'WBTT',
        address: 'TKfjV9RNKJJCqPvBtK8L7Knykh7DNWvnYt',
        chainId: 999,
        decimals: 6,
        name: 'Wrapped BitTorrent',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/TKfjV9RNKJJCqPvBtK8L7Knykh7DNWvnYt.png',
    },
    {
        symbol: 'WTRX',
        address: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
        chainId: 999,
        decimals: 6,
        name: 'Wrapped TRX',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png',
    },
    {
        symbol: 'JST',
        address: 'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9',
        chainId: 999,
        decimals: 18,
        name: 'JUST GOV v1.0',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/just_icon.png',
    },
    {
        symbol: 'WIN',
        address: 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
        chainId: 999,
        decimals: 6,
        name: 'WINK',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/profile_images/JKtJTydD_400x400.jpg',
    },
    {
        symbol: 'USDT',
        address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        chainId: 999,
        decimals: 6,
        name: 'Tether USD',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/usdtlogo.png',
    },
    {
        symbol: 'USDJ',
        address: 'TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT',
        chainId: 999,
        decimals: 18,
        name: 'JUST Stablecoin v1.0',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/usdj.png',
    },
    {
        symbol: 'TUSD',
        address: 'TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4',
        chainId: 999,
        decimals: 18,
        name: 'TrueUSD',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4.png',
    },
    {
        symbol: 'LTC',
        address: 'TR3DLthpnDdCGabhVDbD3VMsiJoCXY3bZd',
        chainId: 999,
        decimals: 8,
        name: 'Litecoin',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/TR3DLthpnDdCGabhVDbD3VMsiJoCXY3bZd.png',
    },
    {
        symbol: 'HT',
        address: 'TDyvndWuvX5xTBwHPYJi7J3Yq8pq8yh62h',
        chainId: 999,
        decimals: 18,
        name: 'HuobiToken',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/logo/TDyvndWuvX5xTBwHPYJi7J3Yq8pq8yh62h.png',
    },
    {
        symbol: 'USDD',
        address: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
        chainId: 999,
        decimals: 18,
        name: 'Decentralized USD',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/upload/logo/TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn.svg',
    },
    {
        symbol: 'BUSD',
        address: 'TMz2SWatiAtZVVcH2ebpsbVtYwUPT9EdjH',
        chainId: 999,
        decimals: 18,
        name: 'BUSD Token',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/upload/logo/new/busd-coin1.png',
    },
    {
        symbol: 'sTRX',
        address: 'TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5',
        chainId: 999,
        decimals: 18,
        name: 'staked TRX',
        aggregators: ["SunSwap"],
        occurrences: 10,
        type: 'trc20',
        iconUrl: 'https://static.tronscan.org/production/upload/logo/new/TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5.png',
    },
];
'';
//# sourceMappingURL=token-service.js.map