import * as sinon from 'sinon';
import HttpProvider from 'ethjs-provider-http';
import {
  ContactEntry,
  PreferencesController,
} from '@metamask/preferences-controller';
import { query } from '@metamask/controller-utils';
import { AccountTrackerController } from './AccountTrackerController';

// jest.mock('@metamask/controller-utils', () => {
//   return {
//     ...jest.requireActual('@metamask/controller-utils'),
//     query: jest.fn(),
//   };
// });

const mockedQuery = query as jest.Mock<
  ReturnType<typeof query>,
  Parameters<typeof query>
>;

const provider = new HttpProvider(
  // 'https://ropsten.infura.io/v3/341eacb578dd44a1a049cbc5f6fd4035',
  'https://nile.trongrid.io/jsonrpc',
);

describe('AccountTrackerController', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should set default state', () => {
    console.log("########## should set default state");

    const controller = new AccountTrackerController({
      onPreferencesStateChange: sinon.stub(),
      getIdentities: () => ({}),
    });
    expect(controller.state).toStrictEqual({
      accounts: {},
    });
  });

  // it('should throw when provider property is accessed', () => {
  //   const controller = new AccountTrackerController({
  //     onPreferencesStateChange: sinon.stub(),
  //     getIdentities: () => ({}),
  //   });
  //   expect(() => console.log(controller.provider)).toThrow(
  //     'Property only used for setting',
  //   );
  // });

  it('should get real balance', async () => {
    console.log("########## should get real balance");
    const address = 'TSPt8QZwwc4yzRzBaXQ575o5vQztWt1pvQ';
    const controller = new AccountTrackerController(
      {
        onPreferencesStateChange: sinon.stub(),
        getIdentities: () => {
          return { [address]: {} as ContactEntry };
        },
      },
      { provider },
    );
    await controller.refresh();

    console.log("🌈🌈🌈 controller.state.accounts: ", controller.state.accounts);

    expect(controller.state.accounts[address].balance).toBeDefined();
  });

  // it('should sync balance with addresses', async () => {
  //   const address = '41B42CA82D507D1B871D85FF79AC7C2F81B578FB3E';
  //   const controller = new AccountTrackerController(
  //     {
  //       onPreferencesStateChange: sinon.stub(),
  //       getIdentities: () => {
  //         return {};
  //       },
  //     },
  //     { provider },
  //   );
  //   // mockedQuery.mockReturnValue(Promise.resolve('0x10'));
  //   const result = await controller.syncBalanceWithAddresses([address]);

  //   console.log("🌈🌈🌈 result: ", result);


  //   // expect(result[address].balance).toBe('0x10');
  // });

  // it('should sync addresses', () => {
  //   const controller = new AccountTrackerController(
  //     {
  //       onPreferencesStateChange: sinon.stub(),
  //       getIdentities: () => {
  //         return { baz: {} as ContactEntry };
  //       },
  //     },
  //     { provider },
  //     {
  //       accounts: {
  //         bar: { balance: '' },
  //         foo: { balance: '' },
  //       },
  //     },
  //   );
  //   controller.refresh();
  //   expect(controller.state.accounts).toStrictEqual({
  //     baz: { balance: '0x0' },
  //   });
  // });

  // it('should subscribe to new sibling preference controllers', async () => {
  //   const preferences = new PreferencesController();
  //   const controller = new AccountTrackerController(
  //     {
  //       onPreferencesStateChange: (listener) => preferences.subscribe(listener),
  //       getIdentities: () => ({}),
  //     },
  //     { provider },
  //   );
  //   controller.refresh = sinon.stub();

  //   preferences.setFeatureFlag('foo', true);
  //   expect((controller.refresh as any).called).toBe(true);
  // });

  // it('should call refresh every ten seconds', async () => {
  //   await new Promise<void>((resolve) => {
  //     const preferences = new PreferencesController();
  //     const poll = sinon.spy(AccountTrackerController.prototype, 'poll');
  //     const controller = new AccountTrackerController(
  //       {
  //         onPreferencesStateChange: (listener) =>
  //           preferences.subscribe(listener),
  //         getIdentities: () => ({}),
  //       },
  //       { provider, interval: 100 },
  //     );
  //     sinon.stub(controller, 'refresh');

  //     expect(poll.called).toBe(true);
  //     expect(poll.calledTwice).toBe(false);
  //     setTimeout(() => {
  //       expect(poll.calledTwice).toBe(true);
  //       resolve();
  //     }, 120);
  //   });
  // });
});
