#[cfg(test)]
mod tests {
    use game_marketplace::marketplace::{
        IGameMarketplaceDispatcher, IGameMarketplaceDispatcherTrait
    };
    use starknet::{ContractAddress, contract_address_const};
    use snforge_std::{
        ContractClassTrait, CheatSpan, DeclareResultTrait, cheat_caller_address , declare
    };

    // Helper addresses
    fn owner() -> ContractAddress {
        contract_address_const::<'owner'>()
    }

    fn seller() -> ContractAddress {
        contract_address_const::<'seller'>()
    }

    fn buyer() -> ContractAddress {
        contract_address_const::<'buyer'>()
    }

    fn game_contract() -> ContractAddress {
        contract_address_const::<'game'>()
    }

    // Deploy marketplace helper
    fn deploy_marketplace(owner: ContractAddress) -> (ContractAddress, IGameMarketplaceDispatcher) {
        let contract = declare("GameMarketplace").unwrap().contract_class();
        let mut calldata = array![];
        calldata.append(owner.into());
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        (contract_address, IGameMarketplaceDispatcher { contract_address })
    }

    // ============================================================================
    // LISTING TESTS
    // ============================================================================

    #[test]
    fn test_list_asset_success() {
        let owner_addr = owner();
        let seller_addr = seller();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List an asset as seller
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(1));
        let listing_id = marketplace.list_asset(game_contract(), 123, 1000);

        // Verify listing was created
        let listing = marketplace.get_listing(listing_id);
        assert(listing.seller == seller_addr, 'Wrong seller');
        assert(listing.asset_id == 123, 'Wrong asset_id');
        assert(listing.price_btc_sats == 1000, 'Wrong price');
        assert(listing.is_active, 'Listing not active');
    }

    #[test]
    #[should_panic(expected: ('Price must be greater than 0',))]
    fn test_list_asset_zero_price() {
        let owner_addr = owner();
        let seller_addr = seller();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // Should panic when listing with zero price
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(1));
        marketplace.list_asset(game_contract(), 123, 0);
    }

    #[test]
    fn test_list_multiple_assets() {
        let owner_addr = owner();
        let seller_addr = seller();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(2));

        // List first asset
        let id1 = marketplace.list_asset(game_contract(), 1, 1000);

        // List second asset
        let id2 = marketplace.list_asset(game_contract(), 2, 2000);

        // Verify both listings exist
        let listing1 = marketplace.get_listing(id1);
        let listing2 = marketplace.get_listing(id2);

        assert(listing1.asset_id == 1, 'Wrong asset_id 1');
        assert(listing2.asset_id == 2, 'Wrong asset_id 2');
        assert(id1 != id2, 'IDs should be different');
    }

    // ============================================================================
    // PURCHASE TESTS
    // ============================================================================

    #[test]
    fn test_buy_asset_success() {
        let owner_addr = owner();
        let seller_addr = seller();
        let buyer_addr = buyer();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List an asset as seller
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(1));
        let listing_id = marketplace.list_asset(game_contract(), 123, 1000);

        // Buy as buyer
        cheat_caller_address(marketplace_address, buyer_addr, CheatSpan::TargetCalls(1));
        marketplace.buy_asset(listing_id, 'swap_proof');

        // Verify listing is now inactive
        let listing = marketplace.get_listing(listing_id);
        assert(!listing.is_active, 'Should be inactive');
    }

    #[test]
    #[should_panic(expected: ('Cannot buy own asset',))]
    fn test_buy_own_asset() {
        let owner_addr = owner();
        let seller_addr = seller();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List and try to buy own asset
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(2));
        let listing_id = marketplace.list_asset(game_contract(), 123, 1000);
        marketplace.buy_asset(listing_id, 'swap_proof');
    }

    #[test]
    #[should_panic(expected: ('Listing not active',))]
    fn test_buy_inactive_listing() {
        let owner_addr = owner();
        let seller_addr = seller();
        let buyer_addr = buyer();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List and cancel
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(2));
        let listing_id = marketplace.list_asset(game_contract(), 123, 1000);
        marketplace.cancel_listing(listing_id);

        // Try to buy cancelled listing
        cheat_caller_address(marketplace_address, buyer_addr, CheatSpan::TargetCalls(1));
        marketplace.buy_asset(listing_id, 'swap_proof');
    }

    // ============================================================================
    // DELISTING TESTS
    // ============================================================================

    #[test]
    fn test_cancel_listing_success() {
        let owner_addr = owner();
        let seller_addr = seller();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List and cancel
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(2));
        let listing_id = marketplace.list_asset(game_contract(), 123, 1000);
        marketplace.cancel_listing(listing_id);

        // Verify listing is inactive
        let listing = marketplace.get_listing(listing_id);
        assert(!listing.is_active, 'Should be inactive');
    }

    #[test]
    #[should_panic(expected: ('Not the seller',))]
    fn test_cancel_listing_not_seller() {
        let owner_addr = owner();
        let seller_addr = seller();
        let buyer_addr = buyer();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List as seller
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(1));
        let listing_id = marketplace.list_asset(game_contract(), 123, 1000);

        // Try to cancel as non-seller
        cheat_caller_address(marketplace_address, buyer_addr, CheatSpan::TargetCalls(1));
        marketplace.cancel_listing(listing_id);
    }

    // ============================================================================
    // QUERY TESTS
    // ============================================================================

    #[test]
    fn test_get_user_listings() {
        let owner_addr = owner();
        let seller_addr = seller();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List multiple assets
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(2));
        marketplace.list_asset(game_contract(), 1, 1000);
        marketplace.list_asset(game_contract(), 2, 2000);

        // Get seller's listings
        let listings = marketplace.get_user_listings(seller_addr);
        assert(listings.len() == 2, 'Should have 2 listings');
    }

    #[test]
    fn test_get_active_listings() {
        let owner_addr = owner();
        let seller_addr = seller();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List 3 assets
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(4));
        marketplace.list_asset(game_contract(), 1, 1000);
        let listing_id2 = marketplace.list_asset(game_contract(), 2, 2000);
        marketplace.list_asset(game_contract(), 3, 3000);

        // Cancel one
        marketplace.cancel_listing(listing_id2);

        // Should have 2 active listings
        let active = marketplace.get_active_listings();
        assert(active.len() == 2, 'Should have 2 active');
    }

    #[test]
    fn test_update_price() {
        let owner_addr = owner();
        let seller_addr = seller();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List an asset
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(2));
        let listing_id = marketplace.list_asset(game_contract(), 123, 1000);

        // Update price
        marketplace.update_price(listing_id, 2000);

        // Verify new price
        let listing = marketplace.get_listing(listing_id);
        assert(listing.price_btc_sats == 2000, 'Price not updated');
    }

    #[test]
    #[should_panic(expected: ('Not the seller',))]
    fn test_update_price_not_seller() {
        let owner_addr = owner();
        let seller_addr = seller();
        let buyer_addr = buyer();
        let (marketplace_address, marketplace) = deploy_marketplace(owner_addr);

        // List as seller
        cheat_caller_address(marketplace_address, seller_addr, CheatSpan::TargetCalls(1));
        let listing_id = marketplace.list_asset(game_contract(), 123, 1000);

        // Try to update as non-seller
        cheat_caller_address(marketplace_address, buyer_addr, CheatSpan::TargetCalls(1));
        marketplace.update_price(listing_id, 2000);
    }
}
