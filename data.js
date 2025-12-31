const GAMES_DATA = {
    guess_mood: {
        title: "Guess the Mood",
        icon: "fa-theater-masks",
        description: "Reveal the blurred emoji/image.",
        type: "slider_reveal",
        content: [
            { image: "😊", answer: "Happy" },
            { image: "😡", answer: "Angry" },
            { image: "🤔", answer: "Thinking" },
            { image: "🤣", answer: "Laughing" },
            { image: "😢", answer: "Sad" },
            { image: "😎", answer: "Cool" },
            { image: "😴", answer: "Sleepy" },
            { image: "😱", answer: "Shocked" },
            { image: "🥳", answer: "Party" },
            { image: "🤯", answer: "Mind Blown" },
            { image: "🤡", answer: "Clown" },
            { image: "👻", answer: "Ghost" },
            { image: "👽", answer: "Alien" },
            { image: "🤖", answer: "Robot" },
            { image: "🤐", answer: "Zip It" },
            { image: "🤠", answer: "Cowboy" },
            { image: "😇", answer: "Angel" },
            { image: "🤒", answer: "Sick" },
            { image: "🤥", answer: "Liar" },
            { image: "🧐", answer: "Investigator" }
        ]
    },
    guess_word: {
        title: "Guess the Word",
        icon: "fa-puzzle-piece",
        description: "Clues reveal the hidden word.",
        type: "timed_clues",
        content: [
            { word: "Unity", clues: ["Spiritual", "Components", "Togetherness"] },
            { word: "Music", clues: ["Sound", "Earphones", "Beat"] },
            { word: "Future", clues: ["Time", "Tomorrow", "Hope"] },
            { word: "History", clues: ["Past", "School Subject", "Dates"] },
            { word: "Water", clues: ["Liquid", "Ocean", "Drink"] },
            { word: "Fire", clues: ["Hot", "Red", "Camp"] },
            { word: "Earth", clues: ["Planet", "Soil", "Ground"] },
            { word: "Air", clues: ["Breath", "Wind", "Invisible"] },
            { word: "Space", clues: ["Stars", "Void", "NASA"] },
            { word: "Light", clues: ["Sun", "Bright", "Lamp"] },
            { word: "Shadow", clues: ["Dark", "Follows You", "Night"] },
            { word: "Mirror", clues: ["Reflect", "Glass", "Look"] },
            { word: "Camera", clues: ["Photo", "Lens", "Click"] },
            { word: "Phone", clues: ["Call", "App", "Mobile"] },
            { word: "Book", clues: ["Read", "Pages", "Story"] }
        ]
    },
    riddle_challenge: {
        title: "Riddle Challenge",
        icon: "fa-question-circle",
        description: "Solve the brain teaser.",
        type: "reveal_answer",
        content: [
            { question: "What comes down but never goes up?", answer: "Rain" },
            { question: "I hove branches, but no fruit, trunk or leaves.", answer: "A Bank" },
            { question: "What can you catch, but not throw?", answer: "A Cold" },
            { question: "What begins with T, ends with T, and has T in it?", answer: "Teapot" },
            { question: "What has legs, but doesn't walk?", answer: "A Table" },
            { question: "What kind of band never plays music?", answer: "A Rubber Band" },
            { question: "What has many teeth, but can't bite?", answer: "A Comb" },
            { question: "What is cut on a table, but never eaten?", answer: "A Deck of Cards" },
            { question: "What has words, but never speaks?", answer: "A Book" },
            { question: "What goes round the wood but never goes into the wood?", answer: "Bark" },
            { question: "I'm tall when I'm young, short when I'm old.", answer: "Candle" },
            { question: "What is full of holes but still holds water?", answer: "Sponge" },
            { question: "What gets wet while drying?", answer: "Towel" },
            { question: "I shave every day, but my beard stays the same.", answer: "Barber" },
            { question: "What can you break, even if you never pick it up?", answer: "Promise" }
        ]
    },
    meme_caption: {
        title: "Meme Caption",
        icon: "fa-laugh-squint",
        description: "Caption the image live!",
        type: "image_display",
        content: [
            { image: "https://i.imgflip.com/1g8my4.jpg" },
            { image: "https://i.imgflip.com/26am.jpg" },
            { image: "https://i.imgflip.com/1jwhww.jpg" },
            { image: "https://i.imgflip.com/30b1gx.jpg" },
            { image: "https://i.imgflip.com/261o3j.jpg" },
            { image: "https://i.imgflip.com/9ehk.jpg" },
            { image: "https://i.imgflip.com/1ur9b0.jpg" },
            { image: "https://i.imgflip.com/28j0te.jpg" },
            { image: "https://i.imgflip.com/1otk96.jpg" },
            { image: "https://i.imgflip.com/2Yb55.jpg" },
            { image: "https://i.imgflip.com/39t1o.jpg" },
            { image: "https://i.imgflip.com/1bhw.jpg" },
            { image: "https://i.imgflip.com/1b424.jpg" },
            { image: "https://i.imgflip.com/1c1uej.jpg" },
            { image: "https://i.imgflip.com/1tl71a.jpg" }
        ]
    },
    guess_sound: {
        title: "Guess the Sound",
        icon: "fa-headphones",
        description: "Listen and identify.",
        type: "audio_play",
        content: [
            { audio: "", answer: "Elephant" },
            { audio: "", answer: "Car Horn" },
            { audio: "", answer: "Doorbell" },
            { audio: "", answer: "Cat Meow" },
            { audio: "", answer: "Dog Bark" },
            { audio: "", answer: "Glass Breaking" },
            { audio: "", answer: "Thunder" },
            { audio: "", answer: "Rain" },
            { audio: "", answer: "Train" },
            { audio: "", answer: "Keyboard Typing" },
            { audio: "", answer: "Sneeze" },
            { audio: "", answer: "Laugh" },
            { audio: "", answer: "Applause" },
            { audio: "", answer: "Clock Ticking" },
            { audio: "", answer: "Phone Ring" }
        ]
    },
    finish_sentence: {
        title: "Finish the Sentence",
        icon: "fa-pencil-alt",
        description: "Complete the phrase.",
        type: "text_complete",
        content: [
            { sentence: "If I could fly, I would ____", clues: ["Travel", "Moon", "Cloud"], answer: "Travel the World" },
            { sentence: "My favorite food is ____", clues: ["Pizza", "Burger", "Salad"], answer: "Pizza" },
            { sentence: "I am scared of ____", clues: ["Spiders", "Dark", "Ghosts"], answer: "Spiders" },
            { sentence: "The best superhero is ____", clues: ["Superman", "Batman", "Mom"], answer: "Batman" },
            { sentence: "School is ____", clues: ["Fun", "Boring", "Long"], answer: "Cool" },
            { sentence: "I want to be a ____", clues: ["Doctor", "Pilot", "Artist"], answer: "Youtuber" },
            { sentence: "Happiness is ____", clues: ["Love", "Peace", "Friends"], answer: "Spending Money" },
            { sentence: "Money cannot buy ____", clues: ["Love", "Time", "Health"], answer: "Happiness" },
            { sentence: "Never EVER ____", clues: ["Give Up", "Lie", "Cheat"], answer: "Give Up" },
            { sentence: "Success takes ____", clues: ["Hard Work", "Patience", "Time"], answer: "Hard Work" },
            { sentence: "Life is like a ____", clues: ["Box of Chocolates", "Rollercoaster"], answer: "Box of Chocolates" },
            { sentence: "I love to ____", clues: ["Sing", "Dance", "Sleep"], answer: "Sleep" },
            { sentence: "My hidden talent is ____", clues: ["Magic", "Drawing", "Singing"], answer: "Being Awesome" },
            { sentence: "A good friend is ____", clues: ["Loyal", "Kind", "Honest"], answer: "Always There" },
            { sentence: "Tomorrow will be ____", clues: ["Better", "Sunny", "Awesome"], answer: "The Best Day" }
        ]
    },
    puzzle_board: {
        title: "Logical Puzzle Board",
        icon: "fa-shapes",
        description: "Patterns and Logic.",
        type: "reveal_answer",
        content: [
            { puzzle: "2, 4, 8, 16, ?", answer: "32" },
            { puzzle: "O, T, T, F, F, ?", answer: "S (Six)" },
            { puzzle: "M, T, W, T, ?", answer: "F (Friday)" },
            { puzzle: "1, 1, 2, 3, 5, ?", answer: "8" },
            { puzzle: "A, Z, B, Y, ?", answer: "C" },
            { puzzle: "Red, Orange, Yellow, Green, ?", answer: "Blue" },
            { puzzle: "Square has 4, Triangle has 3, Line has ?", answer: "1" },
            { puzzle: "9, 18, 27, 36, ?", answer: "45 (x9)" },
            { puzzle: "100, 90, 80, 70, ?", answer: "60" },
            { puzzle: "J, F, M, A, M, ?", answer: "J (June)" },
            { puzzle: "12, 1, 1, 1, 2, 1, ?", answer: "3 (Strokes)" },
            { puzzle: "S, M, T, W, ?", answer: "T (Thursday)" },
            { puzzle: "10, 11, 12, 13, 14, 15, 16, 17, 18, 19, ?", answer: "20" },
            { puzzle: "What is 1/2 of 2/3 of 3/4 of 4/5 of 5/6 of 6/7 of 7/8 of 8/9 of 9/10 of 100?", answer: "10" },
            { puzzle: "Odd one out: Car, Bus, Train, Helicopter", answer: "Helicopter (Air)" }
        ]
    },
    word_chain: {
        title: "Word Chain",
        icon: "fa-link",
        description: "Start a chain reaction.",
        type: "word_chain",
        content: [
            { start_word: "YOUTH" },
            { start_word: "ASSEMBLY" },
            { start_word: "ENERGY" },
            { start_word: "POWER" },
            { start_word: "FUTURE" },
            { start_word: "LEADER" },
            { start_word: "CREATE" },
            { start_word: "INSPIRE" },
            { start_word: "BUILD" },
            { start_word: "DREAM" },
            { start_word: "ACTION" },
            { start_word: "TEAM" },
            { start_word: "UNITY" },
            { start_word: "PEACE" },
            { start_word: "JOY" }
        ]
    },
    challenge_timer: {
        title: "30-Second Challenge",
        icon: "fa-stopwatch",
        description: "Quick fire tasks.",
        type: "challenge_timer",
        content: [
            { challenge: "Stand on one leg" },
            { challenge: "Don't blink!" },
            { challenge: "Name 3 Countries in Asia" },
            { challenge: "Count backwards from 20" },
            { challenge: "Name 5 Vegetables" },
            { challenge: "Name 5 Brands" },
            { challenge: "Say alphabet backwards Z-T" },
            { challenge: "Name 7 things you find in a kitchen" },
            { challenge: "Act like an animal – team must guess" },
            { challenge: "Name 5 apps on your phone (no looking!)" },
            { challenge: "Name 5 things that are round" },
            { challenge: "Do a slow-motion replay of a goal celebration" },
            { challenge: "Name 4 festivals celebrated in India" },
            { challenge: "Say 5 English words without using vowels" },
            { challenge: "Balance on one foot and count till 15" },
            { challenge: "Name 3 superheroes and their powers" },
            { challenge: "Make a funny face without laughing" },
            { challenge: "Name 5 things you carry daily" },
            { challenge: "Name 3 things you see in the sky" },
            { challenge: "Pretend you're a news reporter – say one headline" },
            { challenge: "Name 5 emotions without repeating tone" },
            { challenge: "Say your name backwards letter by letter" },
            { challenge: "Point out 3 red-colored things around you" }

        ]
    },


    random_wheel: {
        title: "Random Wheel",
        icon: "fa-spinner",
        description: "Spin for a result.",
        type: "spin_wheel",
        content: [
            { outcomes: ["Team A", "Team B", "Team C", "Team D"] },
            { outcomes: ["Sing", "Dance", "Joke", "Story"] }
        ]
    },
    universal_timer: {
        title: "Universal Timer",
        icon: "fa-clock",
        description: "Countdown.",
        type: "universal_timer",
        content: [{}]
    }
};
