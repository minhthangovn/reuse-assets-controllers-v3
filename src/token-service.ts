import { timeoutFetch } from '@metamask/controller-utils';
import { isTokenListSupportedForNetwork } from './assetsUtil';
import { NetworksChainId } from '@metamask/controller-utils';

export const TOKEN_END_POINT_API = 'https://token-api.metaswap.codefi.network';
export const TOKEN_METADATA_NO_SUPPORT_ERROR =
  'TokenService Error: Network does not support fetchTokenMetadata';
// Tron token URL
export const MAINNET_TOKEN_END_POINT_API = 'https://api.trongrid.io';
export const TRONGRID_TOKEN_END_POINT_API = 'https://api.shasta.trongrid.io';
export const NILE_TOKEN_END_POINT_API = 'https://nile.trongrid.io';
export const WALLET = 'wallet';
export const WALLETSOLIDITY = 'walletsolidity';

function getTronENDPOINTAPI(chainId: string) {
  let url = TRONGRID_TOKEN_END_POINT_API;

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

function isETHNetwork(chainId: string) {
  return chainId < '990';
}

/**
 * Get the tokens URL for a specific network.
 *
 * @param chainId - The chain ID of the network the tokens requested are on.
 * @returns The tokens URL.
 */
function getTokensURL(chainId: string) {
  return isETHNetwork(chainId)
    ? `${TOKEN_END_POINT_API}/tokens/${chainId}`
    : `${getTronENDPOINTAPI(chainId)}/${WALLET}/getassetissuelist`;
}

/**
 * Get the token metadata URL for the given network and token.
 *
 * @param chainId - The chain ID of the network the token is on.
 * @param tokenAddress - The token address.
 * @returns The token metadata URL.
 */
function getTokenMetadataURL(chainId: string, tokenAddress: string) {
  return isETHNetwork(chainId)
    ? `${TOKEN_END_POINT_API}/token/${chainId}?address=${tokenAddress}`
    : `${getTronENDPOINTAPI(
        chainId,
      )}/${WALLETSOLIDITY}/getassetissuebyname?value=${tokenAddress}`;
}

const tenSecondsInMilliseconds = 10_000;

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
export async function fetchTokenList(
  chainId: string,
  abortSignal: AbortSignal,
  { timeout = defaultTimeout } = {},
): Promise<unknown> {
  const tokenURL = getTokensURL(chainId);

  console.log('#### tokenURL: ', tokenURL);

  const response = await queryApi(tokenURL, abortSignal, timeout);
  return [
    {
      chainId: '999',
      aggregators: ['TraderJoe'],
      // owner_address: '416b1171698969a36e5eb2eb6ea7aa9204d5e10cfc',
      address: '416b1171698969a36e5eb2eb6ea7aa9204d5e10cfc',
      name: '!!!!GOLDCOIN',
      // abbr: 'GOLD',
      symbol: 'GOLD',
      total_supply: 9000000000000000000,
      trx_num: 1000000,
      num: 1000,
      start_time: 1556094180182,
      end_time: 1871799840182,
      description: 'GOLD',
      url: 'https://goldchain.xyz',
      id: '1002341',
    },
    {
      chainId: '999',
      aggregators: ['TraderJoe'],
      address: '418f82a73b283c7bf8515fa3cc2c0399d4d593e2e3',
      name: '!!!!GoldSpot!!!!',
      symbol: 'Gold',
      total_supply: 99000000000,
      frozen_supply: [[Object]],
      trx_num: 1000000,
      num: 100,
      start_time: 1559106000646,
      end_time: 1609451940646,
      description:
        'GoldSpot follow the price of gold in the blockchain!!! Owners will get AGS (aGoldSpot) drop monthly. GoldSpot will be upgraded to a trc20 in 2020. Invest in the gold market!!! Global Gold Traders!!',
      url: 'www.goldspot.eu',
      id: '1002467',
    },
  ];
  // if (response) {
  //   return parseJsonResponse(response);
  // }
  // return undefined;
}

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
export async function fetchTokenMetadata<T>(
  chainId: string,
  tokenAddress: string,
  abortSignal: AbortSignal,
  { timeout = defaultTimeout } = {},
): Promise<T | undefined> {
  if (!isTokenListSupportedForNetwork(chainId)) {
    throw new Error(TOKEN_METADATA_NO_SUPPORT_ERROR);
  }
  const tokenMetadataURL = getTokenMetadataURL(chainId, tokenAddress);
  const response = await queryApi(tokenMetadataURL, abortSignal, timeout);
  if (response) {
    return parseJsonResponse(response) as Promise<T>;
  }
  return undefined;
}

/**
 * Perform fetch request against the api.
 *
 * @param apiURL - The URL of the API to fetch.
 * @param abortSignal - The abort signal used to cancel the request if necessary.
 * @param timeout - The fetch timeout.
 * @returns Promise resolving request response.
 */
async function queryApi(
  apiURL: string,
  abortSignal: AbortSignal,
  timeout: number,
): Promise<Response | undefined> {
  const fetchOptions: RequestInit = {
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
    return await timeoutFetch(apiURL, fetchOptions, timeout);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request is aborted');
    }
  }
  return undefined;
}

/**
 * Parse an API response and return the response JSON data.
 *
 * @param apiResponse - The API response to parse.
 * @returns The response JSON data.
 * @throws Will throw if the response includes an error.
 */
async function parseJsonResponse(apiResponse: Response): Promise<unknown> {
  const responseObj = await apiResponse.json();
  // api may return errors as json without setting an error http status code
  if (responseObj?.error) {
    throw new Error(`TokenService Error: ${responseObj.error}`);
  }
  return responseObj;
}
