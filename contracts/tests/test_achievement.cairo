#[cfg(test)]
mod tests {
    use game_marketplace::achievement_aggregator::{
        IAchievementAggregatorDispatcher, IAchievementAggregatorDispatcherTrait
    };
    use starknet::{ContractAddress, contract_address_const};
    use snforge_std::{
        ContractClassTrait, DeclareResultTrait, CheatSpan, cheat_block_timestamp, declare
    };

    // Helper addresses
    fn owner() -> ContractAddress {
        contract_address_const::<'owner'>()
    }

    fn player() -> ContractAddress {
        contract_address_const::<'player'>()
    }

    fn game1() -> ContractAddress {
        contract_address_const::<'game1'>()
    }

    fn game2() -> ContractAddress {
        contract_address_const::<'game2'>()
    }

    // Deploy achievement aggregator helper
    fn deploy_aggregator(
        owner: ContractAddress
    ) -> (ContractAddress, IAchievementAggregatorDispatcher) {
        let contract = declare("AchievementAggregator").unwrap().contract_class();
        let mut calldata = array![];
        calldata.append(owner.into());
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        (contract_address, IAchievementAggregatorDispatcher { contract_address })
    }

    // ============================================================================
    // ACHIEVEMENT REGISTRATION TESTS
    // ============================================================================

    #[test]
    fn test_register_achievement_success() {
        let owner_addr = owner();
        let (_, aggregator) = deploy_aggregator(owner_addr);

        // Register an achievement
        let achievement_id = aggregator
            .register_achievement(1, 'First Kill', 'Kill first enemy', 10, false);

        // Verify achievement was registered
        let achievement = aggregator.get_achievement(achievement_id);
        assert(achievement.game_id == 1, 'Wrong game_id');
        assert(achievement.name == 'First Kill', 'Wrong name');
        assert(achievement.points == 10, 'Wrong points');
        assert(!achievement.is_cross_game, 'Should not be cross-game');
    }

    #[test]
    fn test_register_cross_game_achievement() {
        let owner_addr = owner();
        let (_, aggregator) = deploy_aggregator(owner_addr);

        // Register cross-game achievement
        let achievement_id = aggregator
            .register_achievement(1, 'MultiGame', 'Play 3 games', 50, true);

        let achievement = aggregator.get_achievement(achievement_id);
        assert(achievement.is_cross_game, 'Should be cross-game');

        // Verify it appears in cross-game list
        let cross_game_achievements = aggregator.get_cross_game_achievements();
        assert(cross_game_achievements.len() == 1, 'Should have 1 cross-game');
    }

    // ============================================================================
    // ACHIEVEMENT UNLOCKING TESTS
    // ============================================================================

    #[test]
    fn test_unlock_achievement_success() {
        let owner_addr = owner();
        let player_addr = player();
        let game1_addr = game1();
        let (aggregator_address, aggregator) = deploy_aggregator(owner_addr);

        // Register achievement
        let achievement_id = aggregator
            .register_achievement(1, 'First Kill', 'Kill first enemy', 10, false);

        // Mock timestamp before unlocking
        cheat_block_timestamp(aggregator_address, 12345, CheatSpan::TargetCalls(1));
        
        // Unlock achievement
        aggregator.unlock_achievement(achievement_id, player_addr, game1_addr);

        // Verify player has the achievement
        assert(
            aggregator.has_achievement(player_addr, achievement_id),
            'Player should have achievement'
        );
    }

    #[test]
    #[should_panic(expected: ('Achievement already unlocked',))]
    fn test_prevent_duplicate_unlock() {
        let owner_addr = owner();
        let player_addr = player();
        let game1_addr = game1();
        let (aggregator_address, aggregator) = deploy_aggregator(owner_addr);

        // Register achievement
        let achievement_id = aggregator
            .register_achievement(1, 'First Kill', 'Kill first enemy', 10, false);

        // Mock timestamp and unlock achievement
        cheat_block_timestamp(aggregator_address, 12345, CheatSpan::TargetCalls(2));
        aggregator.unlock_achievement(achievement_id, player_addr, game1_addr);
        
        // Try to unlock again (should panic)
        aggregator.unlock_achievement(achievement_id, player_addr, game1_addr);
    }

    #[test]
    #[should_panic(expected: ('Achievement does not exist',))]
    fn test_unlock_nonexistent_achievement() {
        let owner_addr = owner();
        let player_addr = player();
        let game1_addr = game1();
        let (_, aggregator) = deploy_aggregator(owner_addr);

        // Try to unlock achievement that doesn't exist
        aggregator.unlock_achievement(999, player_addr, game1_addr);
    }

    // ============================================================================
    // MULTI-GAME ACHIEVEMENT TESTS
    // ============================================================================

    #[test]
    fn test_get_player_achievements_multiple_games() {
        let owner_addr = owner();
        let player_addr = player();
        let game1_addr = game1();
        let game2_addr = game2();
        let (aggregator_address, aggregator) = deploy_aggregator(owner_addr);

        // Register achievements for different games
        let achievement1 = aggregator
            .register_achievement(1, 'Game1 Ach', 'desc1', 10, false);
        let achievement2 = aggregator
            .register_achievement(2, 'Game2 Ach', 'desc2', 20, false);

        // Mock timestamp and unlock both achievements
        cheat_block_timestamp(aggregator_address, 12345, CheatSpan::TargetCalls(2));
        aggregator.unlock_achievement(achievement1, player_addr, game1_addr);
        aggregator.unlock_achievement(achievement2, player_addr, game2_addr);

        // Get all player achievements
        let player_achievements = aggregator.get_player_achievements(player_addr);
        assert(player_achievements.len() == 2, 'Should have 2 achievements');
    }

    #[test]
    fn test_get_achievements_by_game() {
        let owner_addr = owner();
        let player_addr = player();
        let game1_addr = game1();
        let game2_addr = game2();
        let (aggregator_address, aggregator) = deploy_aggregator(owner_addr);

        // Register multiple achievements for game 1
        let ach1 = aggregator.register_achievement(1, 'Kill 10', 'desc1', 10, false);
        let ach2 = aggregator.register_achievement(1, 'Kill 100', 'desc2', 50, false);
        let ach3 = aggregator.register_achievement(2, 'DiffGame', 'desc3', 20, false);

        // Mock timestamp and unlock all achievements
        cheat_block_timestamp(aggregator_address, 12345, CheatSpan::TargetCalls(3));
        aggregator.unlock_achievement(ach1, player_addr, game1_addr);
        aggregator.unlock_achievement(ach2, player_addr, game1_addr);
        aggregator.unlock_achievement(ach3, player_addr, game2_addr);

        // Get achievements for game 1 only
        let game1_achievements = aggregator.get_player_achievements_for_game(player_addr, 1);
        assert(game1_achievements.len() == 2, 'Should have 2 game1 achievement');

        // Get achievements for game 2 only
        let game2_achievements = aggregator.get_player_achievements_for_game(player_addr, 2);
        assert(game2_achievements.len() == 1, 'Should have 1 game2 achievement');
    }

    // ============================================================================
    // POINTS CALCULATION TESTS
    // ============================================================================

    #[test]
    fn test_calculate_total_points() {
        let owner_addr = owner();
        let player_addr = player();
        let game1_addr = game1();
        let (aggregator_address, aggregator) = deploy_aggregator(owner_addr);

        // Register achievements with different point values
        let ach1 = aggregator.register_achievement(1, 'Small', 'desc1', 10, false);
        let ach2 = aggregator.register_achievement(1, 'Medium', 'desc2', 50, false);
        let ach3 = aggregator.register_achievement(1, 'Large', 'desc3', 100, false);

        // Mock timestamp and unlock all achievements
        cheat_block_timestamp(aggregator_address, 12345, CheatSpan::TargetCalls(3));
        aggregator.unlock_achievement(ach1, player_addr, game1_addr);
        aggregator.unlock_achievement(ach2, player_addr, game1_addr);
        aggregator.unlock_achievement(ach3, player_addr, game1_addr);

        // Verify total points
        let total_points = aggregator.get_player_total_points(player_addr);
        assert(total_points == 160, 'Total points should be 160');
    }

    #[test]
    fn test_points_from_multiple_games() {
        let owner_addr = owner();
        let player_addr = player();
        let game1_addr = game1();
        let game2_addr = game2();
        let (aggregator_address, aggregator) = deploy_aggregator(owner_addr);

        // Register achievements for different games
        let ach1 = aggregator.register_achievement(1, 'Game1', 'desc1', 30, false);
        let ach2 = aggregator.register_achievement(2, 'Game2', 'desc2', 70, false);

        // Mock timestamp and unlock both
        cheat_block_timestamp(aggregator_address, 12345, CheatSpan::TargetCalls(2));
        aggregator.unlock_achievement(ach1, player_addr, game1_addr);
        aggregator.unlock_achievement(ach2, player_addr, game2_addr);

        // Verify total points across games
        let total_points = aggregator.get_player_total_points(player_addr);
        assert(total_points == 100, 'Total points should be 100');
    }

    // ============================================================================
    // QUERY TESTS
    // ============================================================================

    #[test]
    fn test_has_achievement() {
        let owner_addr = owner();
        let player_addr = player();
        let game1_addr = game1();
        let (aggregator_address, aggregator) = deploy_aggregator(owner_addr);

        // Register achievement
        let achievement_id = aggregator.register_achievement(1, 'Test', 'desc', 10, false);

        // Initially should not have achievement
        assert(
            !aggregator.has_achievement(player_addr, achievement_id), 'Should not have initially'
        );

        // Mock timestamp and unlock achievement
        cheat_block_timestamp(aggregator_address, 12345, CheatSpan::TargetCalls(1));
        aggregator.unlock_achievement(achievement_id, player_addr, game1_addr);

        // Now should have achievement
        assert(aggregator.has_achievement(player_addr, achievement_id), 'Should have after unlock');
    }

    #[test]
    fn test_get_all_player_achievements_empty() {
        let owner_addr = owner();
        let player_addr = player();
        let (_, aggregator) = deploy_aggregator(owner_addr);

        // Player with no achievements
        let achievements = aggregator.get_player_achievements(player_addr);
        assert(achievements.len() == 0, 'Should have 0 achievements');
    }
}
