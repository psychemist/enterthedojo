use starknet::ContractAddress;

#[derive(Drop, Serde, starknet::Store)]
pub struct Achievement {
    pub id: u256,
    pub game_id: u256,
    pub name: felt252,
    pub description: felt252,
    pub points: u32,
    pub is_cross_game: bool,
}

#[derive(Drop, Serde, starknet::Store)]
pub struct PlayerAchievement {
    pub achievement_id: u256,
    pub player: ContractAddress,
    pub unlocked_at: u64,
    pub game_contract: ContractAddress,
}

#[starknet::interface]
pub trait IAchievementAggregator<TContractState> {
    // Achievement management
    fn register_achievement(
        ref self: TContractState,
        game_id: u256,
        name: felt252,
        description: felt252,
        points: u32,
        is_cross_game: bool
    ) -> u256;

    fn unlock_achievement(
        ref self: TContractState,
        achievement_id: u256,
        player: ContractAddress,
        game_contract: ContractAddress
    );

    // Query functions
    fn get_achievement(self: @TContractState, achievement_id: u256) -> Achievement;

    fn get_player_achievements(self: @TContractState, player: ContractAddress) -> Array<u256>;

    fn get_player_achievements_for_game(
        self: @TContractState, player: ContractAddress, game_id: u256
    ) -> Array<u256>;

    fn get_player_total_points(self: @TContractState, player: ContractAddress) -> u32;

    fn has_achievement(
        self: @TContractState, player: ContractAddress, achievement_id: u256
    ) -> bool;

    fn get_cross_game_achievements(self: @TContractState) -> Array<u256>;
}

#[starknet::contract]
mod AchievementAggregator {
    use super::{Achievement, PlayerAchievement, ContractAddress};
    use starknet::{
        get_block_timestamp,
        storage::{
            Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
            StoragePointerWriteAccess
        }
    };

    #[storage]
    struct Storage {
        achievements: Map<u256, Achievement>,
        player_achievements: Map<(ContractAddress, u256), PlayerAchievement>,
        player_achievement_count: Map<ContractAddress, u256>,
        next_achievement_id: u256,
        owner: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AchievementRegistered: AchievementRegistered,
        AchievementUnlocked: AchievementUnlocked,
    }

    #[derive(Drop, starknet::Event)]
    struct AchievementRegistered {
        #[key]
        achievement_id: u256,
        #[key]
        game_id: u256,
        name: felt252,
        points: u32,
        is_cross_game: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct AchievementUnlocked {
        #[key]
        player: ContractAddress,
        #[key]
        achievement_id: u256,
        #[key]
        game_id: u256,
        points: u32,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.next_achievement_id.write(1);
    }

    #[abi(embed_v0)]
    impl AchievementAggregatorImpl of super::IAchievementAggregator<ContractState> {
        fn register_achievement(
            ref self: ContractState,
            game_id: u256,
            name: felt252,
            description: felt252,
            points: u32,
            is_cross_game: bool
        ) -> u256 {
            // TODO: Verify caller is authorized (game owner or admin)
            let achievement_id = self.next_achievement_id.read();

            let achievement = Achievement {
                id: achievement_id, game_id, name, description, points, is_cross_game,
            };

            self.achievements.write(achievement_id, achievement);
            self.next_achievement_id.write(achievement_id + 1);

            self
                .emit(
                    AchievementRegistered { achievement_id, game_id, name, points, is_cross_game, }
                );

            achievement_id
        }

        fn unlock_achievement(
            ref self: ContractState,
            achievement_id: u256,
            player: ContractAddress,
            game_contract: ContractAddress
        ) {
            // Check if player already has this achievement
            let key = (player, achievement_id);
            let existing = self.player_achievements.read(key);
            assert(existing.unlocked_at == 0, 'Achievement already unlocked');

            let achievement = self.achievements.read(achievement_id);
            assert(achievement.id != 0, 'Achievement does not exist');

            // Store the unlocked achievement
            let player_achievement = PlayerAchievement {
                achievement_id, player, unlocked_at: get_block_timestamp(), game_contract,
            };

            self.player_achievements.write(key, player_achievement);

            // Increment player's achievement count
            let current_count = self.player_achievement_count.read(player);
            self.player_achievement_count.write(player, current_count + 1);

            self
                .emit(
                    AchievementUnlocked {
                        player,
                        achievement_id,
                        game_id: achievement.game_id,
                        points: achievement.points,
                    }
                );
        }

        fn get_achievement(self: @ContractState, achievement_id: u256) -> Achievement {
            self.achievements.read(achievement_id)
        }

        fn get_player_achievements(self: @ContractState, player: ContractAddress) -> Array<u256> {
            let mut achievements = ArrayTrait::new();
            let total_achievements = self.next_achievement_id.read();

            let mut i: u256 = 1;
            loop {
                if i >= total_achievements {
                    break;
                }

                let key = (player, i);
                let player_achievement = self.player_achievements.read(key);
                if player_achievement.unlocked_at != 0 {
                    achievements.append(i);
                }

                i += 1;
            };

            achievements
        }

        fn get_player_achievements_for_game(
            self: @ContractState, player: ContractAddress, game_id: u256
        ) -> Array<u256> {
            let mut achievements = ArrayTrait::new();
            let total_achievements = self.next_achievement_id.read();

            let mut i: u256 = 1;
            loop {
                if i >= total_achievements {
                    break;
                }

                let achievement = self.achievements.read(i);
                if achievement.game_id == game_id {
                    let key = (player, i);
                    let player_achievement = self.player_achievements.read(key);
                    if player_achievement.unlocked_at != 0 {
                        achievements.append(i);
                    }
                }

                i += 1;
            };

            achievements
        }

        fn get_player_total_points(self: @ContractState, player: ContractAddress) -> u32 {
            let mut total_points: u32 = 0;
            let total_achievements = self.next_achievement_id.read();

            let mut i: u256 = 1;
            loop {
                if i >= total_achievements {
                    break;
                }

                let key = (player, i);
                let player_achievement = self.player_achievements.read(key);
                if player_achievement.unlocked_at != 0 {
                    let achievement = self.achievements.read(i);
                    total_points += achievement.points;
                }

                i += 1;
            };

            total_points
        }

        fn has_achievement(
            self: @ContractState, player: ContractAddress, achievement_id: u256
        ) -> bool {
            let key = (player, achievement_id);
            let player_achievement = self.player_achievements.read(key);
            player_achievement.unlocked_at != 0
        }

        fn get_cross_game_achievements(self: @ContractState) -> Array<u256> {
            let mut cross_game = ArrayTrait::new();
            let total_achievements = self.next_achievement_id.read();

            let mut i: u256 = 1;
            loop {
                if i >= total_achievements {
                    break;
                }

                let achievement = self.achievements.read(i);
                if achievement.is_cross_game {
                    cross_game.append(i);
                }

                i += 1;
            };

            cross_game
        }
    }
}
