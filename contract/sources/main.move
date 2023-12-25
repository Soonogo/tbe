module game::game {
    use sui::tx_context::{sender, TxContext};
    use std::string::{utf8,Self, String};
    use sui::transfer;
    use sui::object::{Self,ID, UID};
    use sui::package;
    use sui::display;
    use std::vector;
    use sui::address;
    use sui::clock::{Self, Clock};
    use sui::tx_context::{Self};
    use sui::bcs::{Self};
    use std::debug;
    use sui::hash::blake2b256;
    use sui::event;
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{ timestamp_ms};
    use sui::vec_map::VecMap;
    use sui::vec_map;
    use oracle::weather::{WeatherOracle};

    // --------------- Error Code ---------------

    const ECOINERROR:u64 = 0;

    const EDAILY:u64 = 1;

    const EWITHDRAWAL:u64 = 2;

    const EGAMEMAXMIUMERROR:u64 = 3;

    const EDAILYGAMETIME:u64 = 4;


    // --------------- Constant ---------------

    const GAMEMAXMIUM:u64 = 3;

    const INPUTCOIN:u64 = 100_000_000;

    const DAILYTIME:u64 = 60000 * 60 * 12; // Every 12 hours

    const DAILYGAMETIME:u64 = 60000 * 60 * 2; // Every 2 hours

    struct Profile has key,store {
        id: UID,
        name: String,
        img_url: String,
        description: String
    }

    // --------------- Witness ---------------

    struct GAME has drop {}

    // --------------- Events ----------------

    struct StartGame has copy, drop {
        id: ID,
        result: u64,
        win:u64
    }

    struct ObtainCard has copy, drop {
        result: u32,
    }

    // --------------- Objects ---------------

    struct GameNFT has key,store {
        id :UID,
    }

    struct ClaimCard has key,store {
        id: UID,
        img_url:String,
        type: String,
        model: u64
    }

    struct GamePoolHouse has key,store {
        id:UID,
        balance: u64,
        coin: Balance<SUI>,
        account_map: VecMap<address, u64>,
        game_account_map: VecMap<address, u64>,
        game_account_time_map: VecMap<address, u64>,
    }
    
    // --------------- Function ---------------

    fun init(otw: GAME, ctx: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"link"),
            utf8(b"image_url"),
            utf8(b"description"),
            utf8(b"project_url"),
            utf8(b"creator"),
        ];

        let values = vector[
            utf8(b"{name}"),
            utf8(b"https://github.com/{name}"),
            utf8(b"{img_url}"),
            utf8(b"{description}"),
            utf8(b"https://github.com"),
            utf8(b"Unknown Sui Fan")
        ];
        let card_keys = vector[
            utf8(b"name"),
            utf8(b"link"),
            utf8(b"image_url"),
            utf8(b"description"),
            utf8(b"project_url"),
            utf8(b"creator"),
        ];

        let card_values = vector[
            utf8(b"{name}"),
            utf8(b"https://github.com/{name}"),
            utf8(b"{img_url}"),
            utf8(b"Game Card!"),
            utf8(b"https://github.com/Soonogo/tbe"),
            utf8(b"Unknown Sui Fan")
        ];

        let publisher = package::claim(otw, ctx);

        let display = display::new_with_fields<Profile>(
            &publisher, keys, values, ctx
        );
        let display2 = display::new_with_fields<ClaimCard>(
            &publisher, card_keys, card_values, ctx
        );

        display::update_version(&mut display);
        display::update_version(&mut display2);

        transfer::public_transfer(publisher, sender(ctx));
        transfer::public_transfer(display, sender(ctx));
        transfer::public_transfer(display2, sender(ctx));
        transfer::share_object(GamePoolHouse{
            id: object::new(ctx),
            balance:0,
            coin: balance::zero(),
            account_map: vec_map::empty(),
            game_account_map: vec_map::empty(),
            game_account_time_map: vec_map::empty(),
        })
    }

    public entry fun daily_claim(weather_oracle:&WeatherOracle,gameHouse: &mut GamePoolHouse,clock: &Clock,ctx: &mut TxContext){
        let timestamp = timestamp_ms(clock);
        let receiver = sender(ctx);
        
        if (vec_map::contains(&mut gameHouse.account_map, &receiver)) {
            let value = vec_map::get(&mut gameHouse.account_map, &receiver);
            assert!(timestamp - *value > DAILYTIME , EDAILY);
            update_game_vec(gameHouse, ctx);
            vec_map::insert(&mut gameHouse.account_map, receiver, timestamp);
            daily_lottery(weather_oracle,clock,ctx)
        }else{
            vec_map::insert(&mut gameHouse.account_map, receiver, timestamp);
            daily_lottery(weather_oracle,clock,ctx)

        }
    }

  
    fun update_game_vec( gameHouse:&mut GamePoolHouse,ctx: &mut TxContext){
        let receiver = sender(ctx);
        vec_map::remove(&mut gameHouse.account_map, &receiver);
    }

    fun daily_lottery(weather_oracle:&WeatherOracle,clock:&Clock,ctx: &mut TxContext){
        let r = get_random(weather_oracle,clock,ctx) ;
        // let nine: u32 = 3865470566; // 90%
        // let nine_nine: u32 = 4252017623; // 99%
        if(r % 16 == 0){
             send_claim_nft(b"copper",b"https://ipfs.io/ipfs/bafkreiel7xfens3mgrvgycgj3qiv6qao44me76eu4f3ugwthhmnffjiafi",101,ctx);
             event::emit(ObtainCard{result:101});
            }else if(r % 3 == 0){
             send_claim_nft(b"silver",b"https://ipfs.io/ipfs/bafkreiarcgkfez4xn4kvcuntvd3h54rp34tif6phhg66aenykg7ha7x4wy",102,ctx);
             event::emit(ObtainCard{result:102})
            }else{
             send_claim_nft(b"gold",b"https://ipfs.io/ipfs/bafkreihkanwafumvbi7kcr7i5mawdofpscagnw7tzvg5j4hbqhutb7fmza",103,ctx);
             event::emit(ObtainCard{result:103})
        }
    }

     

    public entry fun mint(name: String, img_url: String,description: String,  ctx: &mut TxContext) {
        let id = object::new(ctx);
        let card = Profile { id, name, img_url ,description};
        transfer::public_transfer(card,sender(ctx))
    }

     fun destory_card(card: ClaimCard){
         let ClaimCard {
            id,
            img_url:_,
            type:_,
            model:_,
        } = card;
        object::delete(id);

     }
    public entry fun withdrawal(card1: ClaimCard, card2: ClaimCard, card3: ClaimCard,gameHouse:&mut GamePoolHouse,ctx: &mut TxContext){
        assert!(card1.model == 101, EWITHDRAWAL);
        assert!(card2.model == 102, EWITHDRAWAL);
        assert!(card3.model == 103, EWITHDRAWAL);
        destory_card(card1);
        destory_card(card2);
        destory_card(card3);
        let claim_split = balance::split(&mut gameHouse.coin, gameHouse.balance);
        let claim_value = coin::from_balance(claim_split, ctx);
        gameHouse.balance = 0;
        transfer::public_transfer(claim_value,sender(ctx))
    }

   
    fun update_user_game_status(clock:u64,gameHouse:&mut GamePoolHouse,value:u64,ctx: &mut TxContext){
        let receiver = sender(ctx);
        vec_map::remove(&mut gameHouse.game_account_map, &receiver);
        vec_map::insert(&mut gameHouse.game_account_map, sender(ctx), value + 1);
    }
    public entry fun coining(coin:&mut Coin<SUI>,balance:u64,gameHouse:&mut GamePoolHouse,ctx:&mut TxContext){
            let split_coin = coin::split(coin, balance, ctx);
            let coin_amount = coin::into_balance(split_coin);
            balance::join(&mut gameHouse.coin,coin_amount);
            gameHouse.balance = gameHouse.balance + balance;
    }

    public entry fun start_game(weather_oracle:&WeatherOracle,gameHouse:&mut GamePoolHouse,guess: u8,clock:&Clock,coin:&mut Coin<SUI>,balance:u64,ctx: &mut TxContext){
        let id = object::new(ctx);
        let timestamp = timestamp_ms(clock);
        let r = get_random(weather_oracle,clock,ctx) % 3;
        let user_coin = coin::value(coin);
        assert!(coin::value(coin) == INPUTCOIN,ECOINERROR);
        let receiver = sender(ctx);
        
        if (vec_map::contains(&mut gameHouse.game_account_map, &receiver)) {
            let value = vec_map::get_mut(&mut gameHouse.game_account_map, &receiver);
            let value2 = vec_map::get_mut(&mut gameHouse.game_account_time_map, &receiver);
            if(*value == GAMEMAXMIUM){
                assert!(*value2 + DAILYGAMETIME < timestamp, EDAILYGAMETIME);
                vec_map::remove(&mut gameHouse.game_account_time_map, &receiver);
                vec_map::remove(&mut gameHouse.game_account_map, &receiver);
                vec_map::insert(&mut gameHouse.game_account_map, receiver, 1);
                vec_map::insert(&mut gameHouse.game_account_time_map, sender(ctx), timestamp);
               
            }else{
                update_user_game_status(timestamp,gameHouse,*value,ctx)
            }
            // assert!(*value != GAMEMAXMIUM, EGAMEMAXMIUMERROR);
            
        }else{
            vec_map::insert(&mut gameHouse.game_account_map, receiver, 1);
            vec_map::insert(&mut gameHouse.game_account_time_map, receiver, timestamp);
        };

        let win=0;
        if(guess==0){
            if(r==0){
                // draw
                win=0
            };
            if(r==1){
                // win
                win=1
            };
            if(r==2){
                // lost
                win=2
            }
        };
        if(guess==1){
            if(r==0){
                // lost
                 win=2
            };
            if(r==1){
                // draw
                 win=0
            };
            if(r==2){
                // win
                 win=1
            }
        };
        if(guess==2){
            if(r==0){
                // win
                 win=1
            };
            if(r==1){
                // lost
                 win=2
            };
            if(r==2){
                // draw
                 win=0
            }
        };

        if(win==1){
            event::emit(StartGame { id:object::uid_to_inner(&id),result:r,win});
            transfer::public_transfer(GameNFT{id},sender(ctx));
            let split_coin = coin::split(coin, balance, ctx);
            let coin_amount = coin::into_balance(split_coin);
            balance::join(&mut gameHouse.coin,coin_amount);
            gameHouse.balance = gameHouse.balance + balance;
            daily_lottery(weather_oracle,clock,ctx)
        }else if(win==2){
            event::emit(StartGame { id:object::uid_to_inner(&id),result:r,win});
            let split_coin = coin::split(coin, balance, ctx);
            let coin_amount = coin::into_balance(split_coin);
            balance::join(&mut gameHouse.coin,coin_amount);
            gameHouse.balance = gameHouse.balance + balance;
            transfer::public_transfer(GameNFT{id},sender(ctx))
        }else{
             event::emit(StartGame { id:object::uid_to_inner(&id),result:r,win});
            let split_coin = coin::split(coin, balance, ctx);
             transfer::public_transfer( split_coin, sender(ctx));
            transfer::public_transfer(GameNFT{id},sender(ctx))

        }
        
    }   
    public fun send_claim_nft(type: vector<u8>,img_url: vector<u8>,model:u64, ctx: &mut TxContext){
        let id = object::new(ctx);
        transfer::public_transfer(ClaimCard {
            id,
            img_url: string::utf8(img_url),
             type:string::utf8(type),
             model
             },sender(ctx))
    }

   fun u32_to_ascii(num: u32): vector<u8>  {
      if (num == 0) {
          return b"0"
      };
      let bytes = vector::empty<u8>();
      while (num > 0) {
          let remainder = num % 10; // get the last digit
          num = num / 10; // remove the last digit
          vector::push_back(&mut bytes, (remainder as u8) + 48); // ASCII value of 0 is 48
      };
      vector::reverse(&mut bytes);
      return bytes
  }

  fun u64_to_ascii(num: u64): vector<u8>  {
      if (num == 0) {
          return b"0"
      };
      let bytes = vector::empty<u8>();
      while (num > 0) {
          let remainder = num % 10; // get the last digit
          num = num / 10; // remove the last digit
          vector::push_back(&mut bytes, (remainder as u8) + 48); // ASCII value of 0 is 48
      };
      vector::reverse(&mut bytes);
      return bytes
  }


  fun get_random(weather_oracle: &WeatherOracle, clock: &Clock,ctx: &TxContext):u64{

    let sender = tx_context::sender(ctx);
    let tx_digest = tx_context::digest(ctx);
    let random_pressure_p = oracle::weather::city_weather_oracle_pressure(weather_oracle, 2988507);
    let random_pressure_l = oracle::weather::city_weather_oracle_pressure(weather_oracle, 88319);

    let random_vector = vector::empty<u8>();
    vector::append(&mut random_vector, address::to_bytes(copy sender));
    vector::append(&mut random_vector, u32_to_ascii(random_pressure_p));
    vector::append(&mut random_vector, u32_to_ascii(random_pressure_l));
    vector::append(&mut random_vector, u64_to_ascii(clock::timestamp_ms(clock)));
    vector::append(&mut random_vector, *copy tx_digest);

    let temp1 = blake2b256(&random_vector);
    let random_num_ex = bcs::peel_u64(&mut bcs::new(temp1));
    let random_value = ((random_num_ex % 123) as u64);
    debug::print(&random_value);
    random_value
  }


}