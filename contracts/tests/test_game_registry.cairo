#[cfg(test)]
mod tests {
    use game_marketplace::game_registry::{IGameRegistryDispatcher, IGameRegistryDispatcherTrait};
    use starknet::{ContractAddress, contract_address_const};
    use snforge_std::{
        ContractClassTrait, DeclareResultTrait, CheatSpan,
        cheat_block_timestamp, cheat_caller_address, declare
    };

    // Helper addresses
    fn owner() -> ContractAddress {
        contract_address_const::<'owner'>()
    }

    fn game1_contract() -> ContractAddress {
        contract_address_const::<'game1'>()
    }

    fn game2_contract() -> ContractAddress {
        contract_address_const::<'game2'>()
    }

    fn non_owner() -> ContractAddress {
        contract_address_const::<'non_owner'>()
    }

    // Deploy game registry helper
    fn deploy_registry(owner: ContractAddress) -> (ContractAddress, IGameRegistryDispatcher) {
        let contract = declare("GameRegistry").unwrap().contract_class();
        let mut calldata = array![];
        calldata.append(owner.into());
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        (contract_address, IGameRegistryDispatcher { contract_address })
    }

    // ============================================================================
    // GAME REGISTRATION TESTS
    // ============================================================================

    #[test]
    fn test_register_game_success() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let (registry_address, registry) = deploy_registry(owner_addr);

        // Mock timestamp before registration
        cheat_block_timestamp(registry_address, 12345, CheatSpan::TargetCalls(1));
        
        // Register a game
        let game_id = registry.register_game(game1_addr, 'Eternum');

        // Verify game was registered
        let game_info = registry.get_game(game_id);
        assert(game_info.contract_address == game1_addr, 'Wrong contract address');
        assert(game_info.name == 'Eternum', 'Wrong game name');
        assert(!game_info.is_verified, 'Should not be verified');
        assert(game_info.registered_at == 12345, 'Wrong timestamp');
    }

    #[test]
    #[should_panic(expected: ('Game already registered',))]
    fn test_register_duplicate_game() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let (_, registry) = deploy_registry(owner_addr);

        // Register game twice (should panic on second)
        registry.register_game(game1_addr, 'Eternum');
        registry.register_game(game1_addr, 'Eternum Duplicate');
    }

    #[test]
    fn test_register_multiple_games() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let game2_addr = game2_contract();
        let (_, registry) = deploy_registry(owner_addr);

        // Register two different games
        let game_id1 = registry.register_game(game1_addr, 'Eternum');
        let game_id2 = registry.register_game(game2_addr, 'Loot Survivor');

        // Verify both were registered
        assert(game_id1 != game_id2, 'Game IDs should be different');

        let game1_info = registry.get_game(game_id1);
        let game2_info = registry.get_game(game_id2);

        assert(game1_info.name == 'Eternum', 'Wrong game1 name');
        assert(game2_info.name == 'Loot Survivor', 'Wrong game2 name');
    }

    #[test]
    fn test_is_game_registered() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let game2_addr = game2_contract();
        let (_, registry) = deploy_registry(owner_addr);

        // Initially not registered
        assert(!registry.is_game_registered(game1_addr), 'Should not be registered');

        // Register game
        registry.register_game(game1_addr, 'Eternum');

        // Now should be registered
        assert(registry.is_game_registered(game1_addr), 'Should be registered');

        // Different game should not be registered
        assert(!registry.is_game_registered(game2_addr), 'Game2 should not be registered');
    }

    // ============================================================================
    // GAME VERIFICATION TESTS
    // ============================================================================

    #[test]
    fn test_verify_game_success() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let (registry_address, registry) = deploy_registry(owner_addr);

        // Register game
        let game_id = registry.register_game(game1_addr, 'Eternum');

        // Verify game as owner
        cheat_caller_address(registry_address, owner_addr, CheatSpan::TargetCalls(1));
        registry.verify_game(game_id);

        // Check game is verified
        let game_info = registry.get_game(game_id);
        assert(game_info.is_verified, 'Game should be verified');
    }

    #[test]
    #[should_panic(expected: ('Only owner can verify',))]
    fn test_verify_game_not_owner() {
        let owner_addr = owner();
        let non_owner_addr = non_owner();
        let game1_addr = game1_contract();
        let (registry_address, registry) = deploy_registry(owner_addr);

        // Register game
        let game_id = registry.register_game(game1_addr, 'Eternum');

        // Try to verify as non-owner (should panic)
        cheat_caller_address(registry_address, non_owner_addr, CheatSpan::TargetCalls(1));
        registry.verify_game(game_id);
    }

    #[test]
    #[should_panic(expected: ('Game already verified',))]
    fn test_verify_already_verified_game() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let (registry_address, registry) = deploy_registry(owner_addr);

        // Register and verify game
        let game_id = registry.register_game(game1_addr, 'Eternum');
        cheat_caller_address(registry_address, owner_addr, CheatSpan::TargetCalls(2));
        registry.verify_game(game_id);

        // Try to verify again (should panic)
        registry.verify_game(game_id);
    }

    #[test]
    fn test_unverify_game_success() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let (registry_address, registry) = deploy_registry(owner_addr);

        // Register and verify game
        let game_id = registry.register_game(game1_addr, 'Eternum');
        cheat_caller_address(registry_address, owner_addr, CheatSpan::TargetCalls(2));
        registry.verify_game(game_id);

        // Unverify game
        registry.unverify_game(game_id);

        // Check game is unverified
        let game_info = registry.get_game(game_id);
        assert(!game_info.is_verified, 'Game should be unverified');
    }

    #[test]
    #[should_panic(expected: ('Only owner can unverify',))]
    fn test_unverify_game_not_owner() {
        let owner_addr = owner();
        let non_owner_addr = non_owner();
        let game1_addr = game1_contract();
        let (registry_address, registry) = deploy_registry(owner_addr);

        // Register and verify game
        let game_id = registry.register_game(game1_addr, 'Eternum');
        cheat_caller_address(registry_address, owner_addr, CheatSpan::TargetCalls(1));
        registry.verify_game(game_id);

        // Try to unverify as non-owner (should panic)
        cheat_caller_address(registry_address, non_owner_addr, CheatSpan::TargetCalls(1));
        registry.unverify_game(game_id);
    }

    #[test]
    #[should_panic(expected: ('Game not verified',))]
    fn test_unverify_unverified_game() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let (registry_address, registry) = deploy_registry(owner_addr);

        // Register game (but don't verify)
        let game_id = registry.register_game(game1_addr, 'Eternum');

        // Try to unverify unverified game (should panic)
        cheat_caller_address(registry_address, owner_addr, CheatSpan::TargetCalls(1));
        registry.unverify_game(game_id);
    }

    // ============================================================================
    // QUERY TESTS
    // ============================================================================

    #[test]
    fn test_get_all_games() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let game2_addr = game2_contract();
        let (_, registry) = deploy_registry(owner_addr);

        // Register multiple games
        registry.register_game(game1_addr, 'Eternum');
        registry.register_game(game2_addr, 'Loot Survivor');

        // Get all games
        let all_games = registry.get_all_games();
        assert(all_games.len() == 2, 'Should have 2 games');
    }

    #[test]
    fn test_get_verified_games() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let game2_addr = game2_contract();
        let (registry_address, registry) = deploy_registry(owner_addr);

        // Register two games
        let game_id1 = registry.register_game(game1_addr, 'Eternum');
        registry.register_game(game2_addr, 'Loot Survivor');

        // Verify only first game
        cheat_caller_address(registry_address, owner_addr, CheatSpan::TargetCalls(1));
        registry.verify_game(game_id1);

        // Get verified games
        let verified_games = registry.get_verified_games();
        assert(verified_games.len() == 1, 'Should have 1 verified game');
        assert(*verified_games.at(0) == game_id1, 'Wrong verified game');
    }

    #[test]
    fn test_get_all_games_empty() {
        let owner_addr = owner();
        let (_, registry) = deploy_registry(owner_addr);

        // No games registered
        let all_games = registry.get_all_games();
        assert(all_games.len() == 0, 'Should have 0 games');

        let verified_games = registry.get_verified_games();
        assert(verified_games.len() == 0, 'Should have 0 verified');
    }

    #[test]
    fn test_verify_workflow() {
        let owner_addr = owner();
        let game1_addr = game1_contract();
        let game2_addr = game2_contract();
        let (registry_address, registry) = deploy_registry(owner_addr);

        // Register 3 games
        let id1 = registry.register_game(game1_addr, 'Game1');
        let id2 = registry.register_game(game2_addr, 'Game2');

        // Initially no verified games
        let verified = registry.get_verified_games();
        assert(verified.len() == 0, 'Should have 0 verified');

        // Verify both games
        cheat_caller_address(registry_address, owner_addr, CheatSpan::TargetCalls(2));
        registry.verify_game(id1);
        registry.verify_game(id2);

        // Should have 2 verified games
        let verified = registry.get_verified_games();
        assert(verified.len() == 2, 'Should have 2 verified');

        // Unverify one game
        cheat_caller_address(registry_address, owner_addr, CheatSpan::TargetCalls(1));
        registry.unverify_game(id1);

        // Should have 1 verified game
        let verified = registry.get_verified_games();
        assert(verified.len() == 1, 'Should have 1 after unverify');
        assert(*verified.at(0) == id2, 'Wrong game verified');
    }
}
