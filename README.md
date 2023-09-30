
## nft.scribe Open Source Code Audit

Developement of nft.scribe contract by tlccstudio, who has several years experience authoring and debugging AntelopeIO C++ contracts and has found one [critical bug in 2022](https://dailytelos.net/wp-content/uploads/2023/09/critical_bug-1.jpg), for AntelopeIO C++ pNetwork contracts, with several million in staked bridge capital at risk.

This repository serves as documented due-diligence performed on the nft.scribe smart contract minimize risk of security breaches and ensure predictable functioning of code that handles virtual accounts.  An audit performed by a 3rd party would be more ideal, but until such time, this code serves as a public reference to the open-source code audit performed on the system thus far.  Certainly additional measures can be implemented in the future if this code base is to be widely relied upon.

*This audit does not serve as a basis for official attestation or guaranteee for the nft.scribe smart contract as being totally bug free, or totally secure.*

## Completed So Far (✅ or ❌ or 👷)
### 1. Manual Study
- ❌ Manual: Code Logic Review, public ACTION's
- ❌ Manual: Code Logic Review, private functions
- ❌ Manual: Code Logic Review, structures / structure functions
- ❌ Manual: CPU Efficiency Study & Plan for improvement
### 2. Automated Tests of Public ACTION's
- 👷 Automated: Unit testing of functions w/ out of bounds tests
- 👷 Automated: Table value matching pushed data
- ❌ Automated: Table value addition / subtraction / other tests
- ❌ Automated: Virtual Account Tests
- ❌ Automated: String Size Limitation Testing
### 3. Manual Tests
- 👷 Manual: Unit Tests of Internal Private Functions
- ❌ Manual: Unit Tests of External Private Functions not part of 
### 4. Security Tests
- ❌ Automated: Fake Token Contract Deposits Test
- ❌ Automated: `ACTION post` testing, invalid actions, invalid targets, invalid string data to exploit, etc.
- ❌ Manual: Explore ramifications of other contracts interacting / denying transactions sent to them

### Install
- `git clone <github_repo_url>`
- `cd ./nft.scribe_audit`
- `npm init -y`
- `npm install`

### Setup & Running the Code Audit
- Deploy local node and run on: http://localhost:8888
- Create following accounts with Developer Key: `EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV`
    - `nft.scribe`: deploy the contract nft.scribe, set `nft.scribe@eosio.code` permission on active
    - `orc1.scribe` `orc2.scribe` `orc3.scribe`: for managing oracles, same private key
    - `usr1.scribe` `usr2.scribe` `usr3.scribe`: user accounts, same private key
    - `eosio.token`: eosio.token contract deployed, be sure to set key and create some TLOS token on it
    - `tkn1.scribe` `tkn2.scribe` `tkn3.scribe`: also deploy eosio.token contract, same private key
    - `call nft.scribe ACTION sysdefaults()`: to initialize the nft.scribe values
    - `call nft.scribe ACTION sysfreeze(0)`: to remove freeze status for operation
- `npm test` command in terminal begins running automated tests.  See documentation for Manual tests performed.

