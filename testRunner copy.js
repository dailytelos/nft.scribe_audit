const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig'); 
const fetch = require('node-fetch');
const { assert } = require('chai');
const fs = require('fs');
const path = require('path');

const privateKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
const signatureProvider = new JsSignatureProvider([privateKey]);
const rpc = new JsonRpc('http://localhost:8888', { fetch });
const api = new Api({ rpc, signatureProvider });

const testDir = __dirname + '/tests/';
const testFilesData = fs.readdirSync(testDir)
                    .filter(file => path.extname(file) === '.json')
                    .map(file => ({
                        name: path.basename(file, '.json'),
                        data: require(path.join(testDir, file))
                    }));

async function sendTransaction(account, actionName, actionData, actor, permission) {
    return await api.transact({
        actions: [{
            account: account,
            name: actionName,
            authorization: [{
                actor: actor,
                permission: permission,
            }],
            data: actionData,
        }]
    }, {
        useLastIrreversible: true,
        expireSeconds: 30,
    });
}

describe('nft.scribe testing...', () => {

    beforeEach(done => {
        setTimeout(done, 600);
    });

    testFilesData.forEach(({ name, data }) => {
        describe(`${name} test:`, () => {
            data.forEach(test => {
                it(test.description, async () => {
                    if (test.function === 'sendTransaction') {
                        const result = await sendTransaction(...test.params);
                        if (test.shouldFail) {
                            assert.notExists(result.transaction_id);
                        } else {
                            assert.exists(result.transaction_id);
                        }
                    } else if (test.function === 'get_table_rows') {
                        const tableRows = await rpc.get_table_rows(test.params);
                        assert.exists(tableRows.rows, 'Table is empty');
                        const network = tableRows.rows[0];
                        for (const key in test.expectedValues) {
                            assert.equal(network[key], test.expectedValues[key], `${key} does not match`);
                        }
                    }
                });
            });
        });
    });
    
});
