//testRunner.js
const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig'); 
const fetch = require('node-fetch');
const { assert } = require('chai');
const fs = require('fs');
const path = require('path');
const moment = require('moment'); // You'll need to install the 'moment' package if you haven't already


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
};

async function activateOracleStatus(oracleID, networkID, orcStatus) {
    // Activate orc1.scribe status
    await sendTransaction('nft.scribe', 'orcstatus', {
        oracle_id: oracleID,
        network_id: networkID,
        active: orcStatus
    }, oracleID, 'active');
};

function logErrorToFile(errorDesc, data) {
    // Read the current content of the errors.json file
    let errors = [];
    if (fs.existsSync('errors.json')) {
        const currentContent = fs.readFileSync('errors.json', 'utf8');
        try {
            errors = JSON.parse(currentContent);
        } catch (e) {
            console.error('Error parsing errors.json:', e);
        }
    }

    // Push the new error with a timestamp to the array
    errors.push({
        timestamp: new Date().toISOString(),
        error_desc: errorDesc,
        ...data
    });

    // Write the updated array back to the errors.json file
    fs.writeFileSync('errors.json', JSON.stringify(errors, null, 2));
}


describe('nft.scribe - Unit Tests for networks, oracles, tokens, and nftservice...', () => {

    beforeEach(done => {
        setTimeout(done, 100);
    });

    testFilesData.forEach(({ name, data }) => {
        describe(`${name} test:`, () => {
            data.forEach(test => {
                it(test.description, async () => {
                    try {
                        if (test.function === 'sendTransaction') {
                            const result = await sendTransaction(...test.params);
                            if (test.shouldFail) {
                                logErrorToFile('Transaction should have failed but it succeeded', { result });
                                assert.fail('Transaction should have failed but it succeeded');
                            } else {
                                assert.exists(result.transaction_id, 'Transaction failed but it should have succeeded');
                            }
                        } else if (test.function === 'get_table_rows') {
                            const tableRows = await rpc.get_table_rows(test.params);
                            assert.exists(tableRows.rows, 'Table is empty');
                            const firstRow = tableRows.rows[0];
                            for (const key in test.expectedValues) {

                                if (firstRow && "oracle" in firstRow) {
                                    if(firstRow.oracle[key] !== test.expectedValues[key]) {
                                        logErrorToFile("tableRows provided...", tableRows);
                                        logErrorToFile(`Error struct_oracle: ${key} does not match A`, firstRow.oracle[key]);
                                    }
                                    assert.equal(firstRow.oracle[key], test.expectedValues[key], `${key} does not match A`);
                                } else if (firstRow && "t" in firstRow) {
                                    if(firstRow.t[key] !== test.expectedValues[key]) {
                                        logErrorToFile("tableRows provided...", tableRows);
                                        logErrorToFile(`Error struct_token: ${key} does not match B`, firstRow.t[key]);
                                    }
                                    assert.equal(firstRow.t[key], test.expectedValues[key], `${key} does not match B`);
                                } else if ((firstRow && "contracts" in firstRow) && (key == "contracts")) {
                                    var strContractsFirstRow = JSON.stringify(firstRow.contracts);
                                    var strContractsExpected = JSON.stringify(test.expectedValues[key]);

                                    if(strContractsFirstRow !== strContractsExpected) {
                                        logErrorToFile("tableRows provided...", tableRows);
                                        logErrorToFile("Error contracts: " + strContractsExpected + " does not match C " + strContractsFirstRow, []);
                                    }

                                    assert.equal(strContractsFirstRow, strContractsExpected, `${key} array does not match C`);
                                } else if (firstRow && key === "tokens" && "tokens" in firstRow) {
                                    var found = false;
                                
                                    for(var i=0; i < firstRow.tokens.length; i++) {
                                        if(firstRow.tokens[i].id == test.expectedValues[key]) { found = true; }
                                    }
                                
                                    if(!found) {
                                        logErrorToFile("tableRows provided...", tableRows);
                                        logErrorToFile("Error contracts: " + strtokensExpected + " does not match D" + strTokensFirstRow, []);
                                    }
                                
                                    assert.isTrue(found, `${key} did not have matching id value D`);
                                } else {
                                    if (firstRow[key] !== test.expectedValues[key]) {
                                        logErrorToFile(`${key} does not match E`, firstRow[key]);
                                    }
                                    assert.equal(firstRow[key], test.expectedValues[key], `${key} does not match E`);
                                }
                            }
                        }
                    } catch (error) {
                        if (!test.shouldFail) {
                            //logErrorToFile(error.message, {});
                            throw error; // If the test is not supposed to fail, throw the error
                        }
                        // If the test is supposed to fail, and it does, then it's a success
                    }
                });
            });
        });
    });
});


describe('nft.scribe - Unit Tests for posts.hpp...', () => {

    beforeEach(done => {
        setTimeout(done, 600);
    });

    it('activateOracleStatus - orc1.scribe', async () => {
        const activeOracleResult1 = await activateOracleStatus("orc1.scribe", "eth.mainnet", 1);
    });

    it('activateOracleStatus - orc2.scribe', async () => {
        const activeOracleResult2 = await activateOracleStatus("orc2.scribe", "eth.mainnet", 1);
    });

    it('activateOracleStatus - orc3.scribe', async () => {
        const activeOracleResult3 = await activateOracleStatus("orc3.scribe", "eth.mainnet", 1);
    });

    it('ACTION post by orc1.scribe', async () => {

        // Check the networks table for post_count
        var networkRows = await rpc.get_table_rows({
            json: true,
            code: 'nft.scribe',
            scope: 'nft.scribe', // Assuming the scope for networks table is 'nft.scribe'
            table: 'networks',
            limit: 1,
            lower_bound: 'eth.mainnet'
        });

        //grab starting post_count
        const postCount_start = networkRows.rows[0].post_count;

        // Define the constants
        const network_id = "eth.mainnet";
        const suffix = "nft";
        const contract = "nft.scribe";
        const post_action = "new.user";
        const userid = "1.nft";
        const sign_type = 4; // "eth_signtypeddata_v4" corresponds to the value 4
        const evm_pub_key = "0x3335e5c6094ad126Bb497b122f8D5F42E0D4A4de";
        const nft_id = 1;

        var tMoment = moment();
        var tMomentPlus30 = tMoment.add(30, 'seconds');

        const tps_posted = tMoment.format('YYYY-MM-DD HH:mm:ss');
        const tps_created = tMoment.format('YYYY-MM-DD HH:mm:ss');
        const tps_expires = tMomentPlus30.format('YYYY-MM-DD HH:mm:ss');
        const tps_postedv2 = tMoment.format('YYYY-MM-DDTHH:mm:ss');
        const tps_createdv2 = tMoment.format('YYYY-MM-DDTHH:mm:ss');
        const tps_expiresv2 = tMomentPlus30.format('YYYY-MM-DDTHH:mm:ss');

        const unsigned_data = '{\
            "domain":{\
                "chainId": "0x1",\
                "name":"Test",\
                "verifyingContract":"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",\
                "version":"1"\
            },\
            "message":{\
                "network_id": "eth.mainnet",\
                "suffix": "nft",\
                "contract": "nft.scribe",\
                "post_action": "new.user",\
                "userid": "",\
                "tps_created": "' + tps_created + '",\
                "tps_expires": "' + tps_expires + '",\
                "exe_data": "name.null...a|name.null...a|0|0|0|0|||0.0000 NULL"\
            }\
        }'; 

        const signed_data = "0x4874834a1eab6fddefae5b9a33f28632f8de5c61c89bf0495cc398e093d63c0161a3cd9d2758b1f9d3031dbb155cfa082f48ab14d3a2a07f008a4639a3aa08731c";
    
        //example of unsigned data:"network_id""suffix""contract""post_action""userid""tps_created""tps_expires""exe_data"
        //example exe_data for new.user: "name.null...a,name.null...a,0,0,0,0,,,0.0000 NULL"

        //current format of unsigned_data string
        /*{
            "domain":{
                "chainId": "0x1",
                "name":'Test',
                "verifyingContract":'0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
                "version":'1'
            },
            "message":{
                "network_id": "eth.mainnet",
                "suffix": "nft",
                "contract": "nft.scribe",
                "post_action": "new.user",
                "userid": "",
                "tps_created": tps_created,
                "tps_expires": tps_expires,
                "exe_data": "name.null...a|name.null...a|0|0|0|0|||0.0000 NULL"
            }
        }*/

        // Call the post ACTION
        const postResult = await sendTransaction('nft.scribe', 'post', {
            oracle_id: 'orc1.scribe',
            network_id: network_id,
            suffix: suffix,
            contract: contract,
            post_action: post_action,
            userid: userid,
            sign_type: sign_type,
            evm_pub_key: evm_pub_key,
            nft_id: nft_id,
            unsigned_data: unsigned_data,
            signed_data: signed_data,
            tps_posted: tps_posted,
            tps_created: tps_created,
            tps_expires: tps_expires
        }, 'orc1.scribe', 'active');

        assert.exists(postResult.transaction_id, 'Post transaction failed');

        // Fetch the latest post from the posts table
        const tableRows = await rpc.get_table_rows({
            json: true,
            code: 'nft.scribe',
            scope: 'eth.mainnet',
            table: 'posts',
            limit: 1,
            reverse: true
        });

        assert.exists(tableRows.rows, 'Table is empty');
        const latestPost = tableRows.rows[0];

        // Verify the post data
        assert.equal(latestPost.post.posted_by, 'orc1.scribe', 'Posted by does not match');
        assert.equal(latestPost.post.network_id, network_id, 'Network ID does not match');
        assert.equal(latestPost.post.suffix, suffix, 'Suffix does not match');
        assert.equal(latestPost.post.contract, contract, 'Contract does not match');
        assert.equal(latestPost.post.post_action, post_action, 'Post action does not match');
        assert.equal(latestPost.post.userid, userid, 'User ID does not match');
        assert.equal(latestPost.post.sign_type, sign_type, 'Sign type does not match');
        assert.equal(latestPost.post.pub_key, evm_pub_key, 'EVM Public Key does not match');
        assert.equal(latestPost.post.nft_id, nft_id, 'NFT ID does not match');
        assert.equal(latestPost.post.unsigned_data, unsigned_data, 'Unsigned data does not match');
        assert.equal(latestPost.post.signed_data, signed_data, 'Signed data does not match');
        assert.equal(latestPost.post.tps_posted, tps_postedv2, 'Posted timestamp does not match');
        assert.equal(latestPost.post.tps_created, tps_createdv2, 'Created timestamp does not match');
        assert.equal(latestPost.post.tps_expires, tps_expiresv2, 'Expiration timestamp does not match');


        // Check the networks table for post_count
        networkRows = await rpc.get_table_rows({
            json: true,
            code: 'nft.scribe',
            scope: 'nft.scribe', // Assuming the scope for networks table is 'nft.scribe'
            table: 'networks',
            limit: 1,
            lower_bound: 'eth.mainnet'
        });

        assert.exists(networkRows.rows, 'Networks table is empty');

        const postCount_end = networkRows.rows[0].post_count;
        assert.equal(parseInt(postCount_start) + 1, parseInt(postCount_end), 'Post count did not increase');
    });

    var latestPostId;
    var updatedPost;

    it('Fetching posts for latestPostID', async () => {
        // Fetch the latest post id from the posts table
        const tableRows = await rpc.get_table_rows({
            json: true,
            code: 'nft.scribe',
            scope: 'eth.mainnet',
            table: 'posts',
            limit: 1,
            reverse: true
        });

        latestPostId = tableRows.rows[0].id;
    });

    it('orc2.scribe - Upvote test', async () => {
        // Call the upvote ACTION for orc2.scribe
        const upvoteResultOrc2 = await sendTransaction('nft.scribe', 'upvote', {
            oracle_id: 'orc2.scribe',
            network_id: 'eth.mainnet',
            posts_id: latestPostId
        }, 'orc2.scribe', 'active');

        assert.exists(upvoteResultOrc2.transaction_id, 'Upvote by orc2.scribe failed');
    });

    it('orc3.scribe - Upvote test', async () => {
        // Call the upvote ACTION for orc3.scribe
        const upvoteResultOrc3 = await sendTransaction('nft.scribe', 'upvote', {
            oracle_id: 'orc3.scribe',
            network_id: 'eth.mainnet',
            posts_id: latestPostId
        }, 'orc3.scribe', 'active');

        assert.exists(upvoteResultOrc3.transaction_id, 'Upvote by orc3.scribe failed');
    });

    it('TABLE posts, 2 upvotes added?', async () => {
        // Fetch the latest post again to verify the upvotes
        const updatedTableRows = await rpc.get_table_rows({
            json: true,
            code: 'nft.scribe',
            scope: 'eth.mainnet',
            table: 'posts',
            limit: 1,
            reverse: true
        });

        updatedPost = updatedTableRows.rows[0];
        assert.include(updatedPost.post.upvotes, 'orc2.scribe', 'Upvote by orc2.scribe not found');
        assert.include(updatedPost.post.upvotes, 'orc3.scribe', 'Upvote by orc3.scribe not found');
    });

    it('DeActivateOracleStatus - orc1.scribe', async () => {
        const activeOracleResult1 = await activateOracleStatus("orc1.scribe", "eth.mainnet", 0);
    });

    it('DeActivateOracleStatus - orc2.scribe', async () => {
        const activeOracleResult2 = await activateOracleStatus("orc2.scribe", "eth.mainnet", 0);
    });

    it('DeActivateOracleStatus - orc3.scribe', async () => {
        const activeOracleResult3 = await activateOracleStatus("orc3.scribe", "eth.mainnet", 0);
    });

    // ... other tests

});
