"""
Minting this NFT creates a proof link between the Minter (Tezos) and the declared EVM_address (EVM).
This allows EVM wallets on the Polygon blockchain to place owned Tezos assets into the 
"""

import smartpy as sp

FA2 = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")


class FA2EVMAuth(
    sp.Contract,
    FA2.Admin,
    FA2.ChangeMetadata,
    FA2.WithdrawMutez,
    FA2.OnchainviewBalanceOf,
    FA2.Fa2Nft
):
    def __init__(
        self,
        admin,
        metadata,
        token_metadata={},
        ledger={},
        policy=None,
        metadata_base=None,
        value,
    ):
        FA2.Fa2Nft.__init__(
            self,
            metadata,
            token_metadata=token_metadata,
            ledger=ledger,
            policy=policy,
            metadata_base=metadata_base,
        )
        FA2.Admin.__init__(self, admin)
        self.update_initial_storage(aliasAccount = value)
        self.update_initial_storage(Last_token_id = 0)

    """ //////////////////////////  MINT ////////////////////////// """ 

    # Mint a declaration between sender and included EVM address
    # Param EVM_address
    # Param metadata
    @sp.entry_point
    def mint(self, params):
        with sp.for_("action", params) as action:
                    
            # Update count
            self.data.Last_token_id = self.data.Last_token_id + 1

            # Update EVM address
            self.data.aliasAccount[sp.sender] = action.EVM_address

            token_id = self.data.Last_token_id

            metadata = sp.map(l={
                "decimals": sp.utils.bytes_of_string("%d" % 0),
                "name": sp.utils.bytes_of_string('EVM Tezos Alias Account'),
                "displayUri": sp.utils.bytes_of_string('https://ar.illust.space'),
            })
              
            # Mint the token to the sender address
            self.data.token_metadata[token_id] = sp.record(
                token_id=token_id, token_info=metadata
            )
            self.data.ledger[token_id] = sp.sender

    """ ////////////////////////// ON CHAIN VIEWS ////////////////////////// """

    # Check if an EVM address is alias with a Tezos address
    # Params pair(EVM_address, Tez_address)
    @sp.onchain_view()
    def check_alias_address(self, params):
        params = sp.set_type_expr(params, sp.TPair(sp.TAddress,sp.TString))

        # Check that the EVM address and Tezos address are linked
        sp.verify(self.data.aliasAccount[sp.fst(params)] == sp.snd(params))

        sp.result(self.data.aliasAccount[sp.fst(params)])


""" ////////////////////////// TESTS ////////////////////////// """

if "templates" not in __name__:

    def make_metadata(symbol, name, decimals, EVM_address):
        """Helper function to build metadata JSON bytes values."""
        return sp.map(
            l={
                "decimals": sp.utils.bytes_of_string("%d" % decimals),
                "name": sp.utils.bytes_of_string(name),
                "symbol": sp.utils.bytes_of_string(symbol),
                "EVM_address": sp.utils.bytes_of_string(EVM_address),
            }
        )

    admin = sp.test_account("Administrator")
    alice = sp.test_account("Alice")
    bob = sp.test_account("Bob")
    tok0_md = make_metadata(
        name="Token Zero",
        decimals=1,
        symbol="Tok0",
        EVM_address="0x0000000000000000000000000000000000000000",
    )

    @sp.add_test(name="FA2 NFT tokens")
    def test():
        scenario = sp.test_scenario()
        
        scenario.table_of_contents()

        scenario.h2("FA2")
        contract = FA2EVMAuth(
            value=sp.map(l = {}, tkey = sp.TAddress, tvalue = sp.TString),
            admin=admin.address, metadata=sp.utils.metadata_of_url("https://bafkreiawge7dwggzayqwb755dbvftvraolbjmxkpvqsiyv36vpijw4kjly.ipfs.nftstorage.link/"))
        scenario += contract

        scenario.h1("Minting")
        scenario += contract.mint(
            [sp.record(metadata=tok0_md, EVM_address="0x0000000000000000000000000000000000000001")]
        ).run(sender=alice, valid=True)

        scenario += contract.mint(
            [sp.record(metadata=tok0_md, EVM_address="0x0000000000000000000000000000000000000002")]
        ).run(sender=admin, valid=True)

        scenario += contract.mint(
            [sp.record(metadata=tok0_md, EVM_address="0x0000000000000000000000000000000000000003")]
        ).run(sender=bob, valid=True)

        scenario.h2("is_EVM_address")
        scenario.verify(contract.check_alias_address((alice.address,"0x0000000000000000000000000000000000000001")) == "0x0000000000000000000000000000000000000001")
        scenario.verify(contract.check_alias_address((admin.address,"0x0000000000000000000000000000000000000002")) == "0x0000000000000000000000000000000000000002")
        scenario.verify(contract.check_alias_address((bob.address,"0x0000000000000000000000000000000000000003")) == "0x0000000000000000000000000000000000000003")

    sp.add_compilation_target(
        "fa2_nft_tokens",
        FA2EVMAuth(
            value=sp.map(l = {}, tkey = sp.TAddress, tvalue = sp.TString),
            admin=admin.address, metadata=sp.utils.metadata_of_url("https://bafkreiawge7dwggzayqwb755dbvftvraolbjmxkpvqsiyv36vpijw4kjly.ipfs.nftstorage.link/")
        ),
)
