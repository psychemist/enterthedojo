use starknet::ContractAddress;

#[derive(Drop, Serde, starknet::Store)]
pub struct Listing {
    pub seller: ContractAddress,
    pub game_contract: ContractAddress,
    pub asset_id: u256,
    pub price_btc_sats: u64,
    pub is_active: bool,
    pub listed_at: u64,
}

#[starknet::interface]
pub trait IGameMarketplace<TContractState> {
    fn list_asset(
        ref self: TContractState,
        game_contract: ContractAddress,
        asset_id: u256,
        price_btc_sats: u64
    ) -> u256;

    fn cancel_listing(ref self: TContractState, listing_id: u256);

    fn buy_asset(ref self: TContractState, listing_id: u256, swap_proof: felt252);

    fn update_price(ref self: TContractState, listing_id: u256, new_price_btc_sats: u64);

    fn get_listing(self: @TContractState, listing_id: u256) -> Listing;

    fn get_active_listings(self: @TContractState) -> Array<u256>;

    fn get_user_listings(self: @TContractState, user: ContractAddress) -> Array<u256>;
}

#[starknet::contract]
mod GameMarketplace {
    use super::{ContractAddress, Listing};
    use starknet::{get_caller_address, get_block_timestamp};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess
    };

    #[storage]
    struct Storage {
        listings: Map<u256, Listing>,
        next_listing_id: u256,
        owner: ContractAddress,
        platform_fee_bps: u64, // Basis points (100 = 1%)
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AssetListed: AssetListed,
        AssetSold: AssetSold,
        ListingCancelled: ListingCancelled,
        PriceUpdated: PriceUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct AssetListed {
        #[key]
        listing_id: u256,
        #[key]
        seller: ContractAddress,
        game_contract: ContractAddress,
        asset_id: u256,
        price_btc_sats: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct AssetSold {
        #[key]
        listing_id: u256,
        #[key]
        seller: ContractAddress,
        #[key]
        buyer: ContractAddress,
        price_btc_sats: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct ListingCancelled {
        #[key]
        listing_id: u256,
        #[key]
        seller: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct PriceUpdated {
        #[key]
        listing_id: u256,
        old_price: u64,
        new_price: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.next_listing_id.write(1);
        self.platform_fee_bps.write(250); // 2.5% default fee
    }

    #[abi(embed_v0)]
    impl GameMarketplaceImpl of super::IGameMarketplace<ContractState> {
        fn list_asset(
            ref self: ContractState,
            game_contract: ContractAddress,
            asset_id: u256,
            price_btc_sats: u64
        ) -> u256 {
            let caller = get_caller_address();
            let listing_id = self.next_listing_id.read();

            // TODO: Verify caller owns the asset in the game contract
            // This would require calling the game contract's owner_of function

            assert(price_btc_sats > 0, 'Price must be greater than 0');

            let listing = Listing {
                seller: caller,
                game_contract,
                asset_id,
                price_btc_sats,
                is_active: true,
                listed_at: get_block_timestamp(),
            };

            self.listings.write(listing_id, listing);
            self.next_listing_id.write(listing_id + 1);

            self
                .emit(
                    AssetListed {
                        listing_id, seller: caller, game_contract, asset_id, price_btc_sats,
                    }
                );

            listing_id
        }

        fn cancel_listing(ref self: ContractState, listing_id: u256) {
            let caller = get_caller_address();
            let mut listing = self.listings.read(listing_id);

            assert(listing.is_active, 'Listing not active');
            assert(listing.seller == caller, 'Not the seller');

            listing.is_active = false;
            self.listings.write(listing_id, listing);

            self.emit(ListingCancelled { listing_id, seller: caller, });
        }

        fn buy_asset(ref self: ContractState, listing_id: u256, swap_proof: felt252) {
            let caller = get_caller_address();
            let mut listing = self.listings.read(listing_id);
            let seller = listing.seller;
            let price = listing.price_btc_sats;

            assert(listing.is_active, 'Listing not active');
            assert(listing.seller != caller, 'Cannot buy own asset');

            // TODO: Verify swap_proof shows BTC payment was completed
            // This would integrate with Atomiq's verification system

            // Mark listing as inactive
            listing.is_active = false;
            self.listings.write(listing_id, listing);

            // TODO: Transfer asset ownership
            // This would call the game contract's transfer function

            self.emit(AssetSold { listing_id, seller, buyer: caller, price_btc_sats: price, });
        }

        fn update_price(ref self: ContractState, listing_id: u256, new_price_btc_sats: u64) {
            let caller = get_caller_address();
            let mut listing = self.listings.read(listing_id);

            assert(listing.is_active, 'Listing not active');
            assert(listing.seller == caller, 'Not the seller');
            assert(new_price_btc_sats > 0, 'Price must be greater than 0');

            let old_price = listing.price_btc_sats;
            listing.price_btc_sats = new_price_btc_sats;
            self.listings.write(listing_id, listing);

            self.emit(PriceUpdated { listing_id, old_price, new_price: new_price_btc_sats, });
        }

        fn get_listing(self: @ContractState, listing_id: u256) -> Listing {
            self.listings.read(listing_id)
        }

        fn get_active_listings(self: @ContractState) -> Array<u256> {
            let mut active_listings = ArrayTrait::new();
            let total_listings = self.next_listing_id.read();

            let mut i: u256 = 1;
            loop {
                if i >= total_listings {
                    break;
                }

                let listing = self.listings.read(i);
                if listing.is_active {
                    active_listings.append(i);
                }

                i += 1;
            };

            active_listings
        }

        fn get_user_listings(self: @ContractState, user: ContractAddress) -> Array<u256> {
            let mut user_listings = ArrayTrait::new();
            let total_listings = self.next_listing_id.read();

            let mut i: u256 = 1;
            loop {
                if i >= total_listings {
                    break;
                }

                let listing = self.listings.read(i);
                if listing.seller == user {
                    user_listings.append(i);
                }

                i += 1;
            };

            user_listings
        }
    }
}
