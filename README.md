
## nft.scribe Code Audit

Lead developer @tlccstudio has several years experience authoring and debugging AntelopeIO C++ contracts and has found one [critical bug in 2022](https://github.com/provable-things/ptokens-eos-smart-contracts/issues/1), for AntelopeIO C++ pNetwork contracts, with several million in staked bridge capital at risk.

### Completed So Far (✅ or ❌ or 👷)
- 👷 Automated: Unit testing of functions w/ out of bounds tests
- 👷 Automated: Table value matching pushed data
- ❌ Automated: Table value addition / subtraction / other tests
- ❌ Manual: Logic Conceptual Tests, Edge Cases & Other Investigations
- ❌ Automated: Virtual Account Tests
- ❌ Automated: Fake Token Contract Deposits Test

### Install
- `git clone <github_repo_url>`
- `cd ./nft.scribe_audit`
- `npm init -y`
- `npm install mocha --save-dev`

### Setup & Running the Code Audit
- Deploy local node and run on: http://localhost:8888
- Create following accounts with Developer Key: `EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV`
    - `nft.scribe`: deploy the contract nft.scribe, set `nft.scribe@eosio.code` permission on active
    - `orc1.scribe` `orc2.scribe` `orc3.scribe`: for managing oracles, same private key
    - `usr1.scribe` `usr2.scribe` `usr3.scribe`: user accounts, same private key
    - `eosio.token`: eosio.token contract deployed, be sure to set key and create some TLOS token on it
    - `tkn1.token` `tkn2.token` `tkn3.token`: also deploy eosio.token contract, same private key
- `npm test` command in terminal begins running automated tests.  See documentation for Manual tests performed.

