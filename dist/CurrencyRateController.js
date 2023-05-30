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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CurrencyRateController_enabled;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyRateController = void 0;
const async_mutex_1 = require("async-mutex");
const base_controller_1 = require("@metamask/base-controller");
const controller_utils_1 = require("@metamask/controller-utils");
const crypto_compare_1 = require("./crypto-compare");
const name = 'CurrencyRateController';
const metadata = {
    conversionDate: { persist: true, anonymous: true },
    conversionRate: { persist: true, anonymous: true },
    currentCurrency: { persist: true, anonymous: true },
    nativeCurrency: { persist: true, anonymous: true },
    pendingCurrentCurrency: { persist: false, anonymous: true },
    pendingNativeCurrency: { persist: false, anonymous: true },
    usdConversionRate: { persist: true, anonymous: true },
};
const defaultState = {
    conversionDate: 0,
    conversionRate: 0,
    currentCurrency: 'usd',
    nativeCurrency: 'ETH',
    pendingCurrentCurrency: null,
    pendingNativeCurrency: null,
    usdConversionRate: null,
};
/**
 * Controller that passively polls on a set interval for an exchange rate from the current network
 * asset to the user's preferred currency.
 */
class CurrencyRateController extends base_controller_1.BaseControllerV2 {
    /**
     * Creates a CurrencyRateController instance.
     *
     * @param options - Constructor options.
     * @param options.includeUsdRate - Keep track of the USD rate in addition to the current currency rate.
     * @param options.interval - The polling interval, in milliseconds.
     * @param options.messenger - A reference to the messaging system.
     * @param options.state - Initial state to set on this controller.
     * @param options.fetchExchangeRate - Fetches the exchange rate from an external API. This option is primarily meant for use in unit tests.
     */
    constructor({ includeUsdRate = false, interval = 180000, messenger, state, fetchExchangeRate = crypto_compare_1.fetchExchangeRate, }) {
        super({
            name,
            metadata,
            messenger,
            state: Object.assign(Object.assign({}, defaultState), state),
        });
        this.mutex = new async_mutex_1.Mutex();
        /**
         * A boolean that controls whether or not network requests can be made by the controller
         */
        _CurrencyRateController_enabled.set(this, void 0);
        this.includeUsdRate = includeUsdRate;
        this.intervalDelay = interval;
        this.fetchExchangeRate = fetchExchangeRate;
        __classPrivateFieldSet(this, _CurrencyRateController_enabled, false, "f");
    }
    /**
     * Start polling for the currency rate.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldSet(this, _CurrencyRateController_enabled, true, "f");
            yield this.startPolling();
        });
    }
    /**
     * Stop polling for the currency rate.
     */
    stop() {
        __classPrivateFieldSet(this, _CurrencyRateController_enabled, false, "f");
        this.stopPolling();
    }
    /**
     * Prepare to discard this controller.
     *
     * This stops any active polling.
     */
    destroy() {
        super.destroy();
        this.stopPolling();
    }
    /**
     * Sets a currency to track.
     *
     * @param currentCurrency - ISO 4217 currency code.
     */
    setCurrentCurrency(currentCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            this.update((state) => {
                state.pendingCurrentCurrency = currentCurrency;
            });
            yield this.updateExchangeRate();
        });
    }
    /**
     * Sets a new native currency.
     *
     * @param symbol - Symbol for the base asset.
     */
    setNativeCurrency(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            this.update((state) => {
                state.pendingNativeCurrency = symbol;
            });
            yield this.updateExchangeRate();
        });
    }
    stopPolling() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    /**
     * Starts a new polling interval.
     */
    startPolling() {
        return __awaiter(this, void 0, void 0, function* () {
            this.stopPolling();
            // TODO: Expose polling currency rate update errors
            yield (0, controller_utils_1.safelyExecute)(() => __awaiter(this, void 0, void 0, function* () { return yield this.updateExchangeRate(); }));
            this.intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield (0, controller_utils_1.safelyExecute)(() => __awaiter(this, void 0, void 0, function* () { return yield this.updateExchangeRate(); }));
            }), this.intervalDelay);
        });
    }
    /**
     * Updates exchange rate for the current currency.
     *
     * @returns The controller state.
     */
    updateExchangeRate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _CurrencyRateController_enabled, "f")) {
                console.info('[CurrencyRateController] Not updating exchange rate since network requests have been disabled');
                return this.state;
            }
            const releaseLock = yield this.mutex.acquire();
            const { currentCurrency: stateCurrentCurrency, nativeCurrency: stateNativeCurrency, pendingCurrentCurrency, pendingNativeCurrency, } = this.state;
            let conversionDate = null;
            let conversionRate = null;
            let usdConversionRate = null;
            const currentCurrency = pendingCurrentCurrency !== null && pendingCurrentCurrency !== void 0 ? pendingCurrentCurrency : stateCurrentCurrency;
            const nativeCurrency = pendingNativeCurrency !== null && pendingNativeCurrency !== void 0 ? pendingNativeCurrency : stateNativeCurrency;
            // For preloaded testnets (Rinkeby, Ropsten, Goerli, Kovan) we want to fetch exchange rate for real ETH.
            const nativeCurrencyForExchangeRate = Object.values(controller_utils_1.TESTNET_TICKER_SYMBOLS).includes(nativeCurrency)
                ? controller_utils_1.FALL_BACK_VS_CURRENCY // ETH
                : nativeCurrency;
            try {
                if (currentCurrency &&
                    nativeCurrency &&
                    // if either currency is an empty string we can skip the comparison
                    // because it will result in an error from the api and ultimately
                    // a null conversionRate either way.
                    currentCurrency !== '' &&
                    nativeCurrency !== '') {
                    const fetchExchangeRateResponse = yield this.fetchExchangeRate(currentCurrency, nativeCurrencyForExchangeRate, this.includeUsdRate);
                    conversionRate = fetchExchangeRateResponse.conversionRate;
                    usdConversionRate = fetchExchangeRateResponse.usdConversionRate;
                    conversionDate = Date.now() / 1000;
                }
            }
            catch (error) {
                if (!(error instanceof Error &&
                    error.message.includes('market does not exist for this coin pair'))) {
                    throw error;
                }
            }
            finally {
                try {
                    this.update(() => {
                        return {
                            conversionDate,
                            conversionRate,
                            // we currently allow and handle an empty string as a valid nativeCurrency
                            // in cases where a user has not entered a native ticker symbol for a custom network
                            // currentCurrency is not from user input but this protects us from unexpected changes.
                            nativeCurrency,
                            currentCurrency,
                            pendingCurrentCurrency: null,
                            pendingNativeCurrency: null,
                            usdConversionRate,
                        };
                    });
                }
                finally {
                    releaseLock();
                }
            }
            return this.state;
        });
    }
}
exports.CurrencyRateController = CurrencyRateController;
_CurrencyRateController_enabled = new WeakMap();
exports.default = CurrencyRateController;
//# sourceMappingURL=CurrencyRateController.js.map