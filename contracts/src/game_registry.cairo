use starknet::ContractAddress;

#[derive(Drop, Serde, starknet::Store)]
pub struct GameInfo {
    pub contract_address: ContractAddress,
    pub name: felt252,
    pub is_verified: bool,
    pub registered_at: u64,
}

#[starknet::interface]
pub trait IGameRegistry<TContractState> {
    fn register_game(
        ref self: TContractState, contract_address: ContractAddress, name: felt252
    ) -> u256;

    fn verify_game(ref self: TContractState, game_id: u256);

    fn unverify_game(ref self: TContractState, game_id: u256);

    fn get_game(self: @TContractState, game_id: u256) -> GameInfo;

    fn get_all_games(self: @TContractState) -> Array<u256>;

    fn get_verified_games(self: @TContractState) -> Array<u256>;

    fn is_game_registered(self: @TContractState, contract_address: ContractAddress) -> bool;
}

#[starknet::contract]
mod GameRegistry {
    use super::{GameInfo, ContractAddress};
    use starknet::{get_caller_address, get_block_timestamp};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess
    };

    #[storage]
    struct Storage {
        games: Map<u256, GameInfo>,
        contract_to_game_id: Map<ContractAddress, u256>,
        next_game_id: u256,
        owner: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        GameRegistered: GameRegistered,
        GameVerified: GameVerified,
        GameUnverified: GameUnverified,
    }

    #[derive(Drop, starknet::Event)]
    struct GameRegistered {
        #[key]
        game_id: u256,
        #[key]
        contract_address: ContractAddress,
        name: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct GameVerified {
        #[key]
        game_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct GameUnverified {
        #[key]
        game_id: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.next_game_id.write(1);
    }

    #[abi(embed_v0)]
    impl GameRegistryImpl of super::IGameRegistry<ContractState> {
        fn register_game(
            ref self: ContractState, contract_address: ContractAddress, name: felt252
        ) -> u256 {
            // Check if game is already registered
            let existing_game_id = self.contract_to_game_id.read(contract_address);
            assert(existing_game_id == 0, 'Game already registered');

            let game_id = self.next_game_id.read();

            let game_info = GameInfo {
                contract_address, name, is_verified: false, registered_at: get_block_timestamp(),
            };

            self.games.write(game_id, game_info);
            self.contract_to_game_id.write(contract_address, game_id);
            self.next_game_id.write(game_id + 1);

            self.emit(GameRegistered { game_id, contract_address, name, });

            game_id
        }

        fn verify_game(ref self: ContractState, game_id: u256) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can verify');

            let mut game_info = self.games.read(game_id);
            assert(!game_info.is_verified, 'Game already verified');

            game_info.is_verified = true;
            self.games.write(game_id, game_info);

            self.emit(GameVerified { game_id });
        }

        fn unverify_game(ref self: ContractState, game_id: u256) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can unverify');

            let mut game_info = self.games.read(game_id);
            assert(game_info.is_verified, 'Game not verified');

            game_info.is_verified = false;
            self.games.write(game_id, game_info);

            self.emit(GameUnverified { game_id });
        }

        fn get_game(self: @ContractState, game_id: u256) -> GameInfo {
            self.games.read(game_id)
        }

        fn get_all_games(self: @ContractState) -> Array<u256> {
            let mut all_games = ArrayTrait::new();
            let total_games = self.next_game_id.read();

            let mut i: u256 = 1;
            loop {
                if i >= total_games {
                    break;
                }
                all_games.append(i);
                i += 1;
            };

            all_games
        }

        fn get_verified_games(self: @ContractState) -> Array<u256> {
            let mut verified_games = ArrayTrait::new();
            let total_games = self.next_game_id.read();

            let mut i: u256 = 1;
            loop {
                if i >= total_games {
                    break;
                }

                let game_info = self.games.read(i);
                if game_info.is_verified {
                    verified_games.append(i);
                }

                i += 1;
            };

            verified_games
        }

        fn is_game_registered(self: @ContractState, contract_address: ContractAddress) -> bool {
            let game_id = self.contract_to_game_id.read(contract_address);
            game_id != 0
        }
    }
}
