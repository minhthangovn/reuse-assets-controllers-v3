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

export const MAINNET_URL_LIST_TOKEN_API =
  'https://list.justswap.link/justswap.json';

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
  return chainId < '9900';
}

/**
 * Get the tokens URL for a specific network.
 *
 * @param chainId - The chain ID of the network the tokens requested are on.
 * @returns The tokens URL.
 */
function getTokensURL(chainId: string) {
  // return isETHNetwork(chainId)
  //   ? `${TOKEN_END_POINT_API}/tokens/${chainId}`
  //   : MAINNET_URL_LIST_TOKEN_API;
  return MAINNET_URL_LIST_TOKEN_API;
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

  console.log('#### chainId: ', chainId);
  console.log('#### tokenURL: ', tokenURL);

  const response = await queryApi(tokenURL, abortSignal, timeout);
  if (response) {
    return parseJsonResponseField(response, 'data');
  } else {
    return listTronToken;
  }

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

async function parseJsonResponseField(
  apiResponse: Response,
  field: string,
): Promise<unknown> {
  const responseObj: any = await parseJsonResponse(apiResponse);

  console.log('### parseJsonResponseField: ', responseObj);


  return responseObj[field] ? responseObj[field] : responseObj;
}

const listTronToken: Object[] = ['a'];
