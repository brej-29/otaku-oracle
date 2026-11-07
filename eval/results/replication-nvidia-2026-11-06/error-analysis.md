# Sampled error analysis

Seed 20261106; up to ten incorrect observations per arm, sampled without replacement across unique question/model pairs.
Abstentions and parse failures are included as incorrect and labelled; no examples are fabricated when fewer are available.

## Arm A: 10 sampled of 49 incorrect question/model pairs

| Model / repeat | Question | Gold | Answer | Failure |
|---|---|---|---|---|
| google/gemma-4-31b-it / 0 | "Muchuu sa, Kimi ni.: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 4 | 2 | confident wrong |
| google/gemma-4-31b-it / 0 | "Z/X IGNITION: In which year did this anime start? Return a four-digit integer." | 2014 | 2017 | confident wrong |
| google/gemma-4-31b-it / 0 | "Tokyo Revengers: Chibi Reve: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 5 | 0 | confident wrong |
| google/gemma-4-31b-it / 0 | "DRIFTERS: Which main animation studio or studios are listed for this anime? Return a list of studio names." | ["Hoods Entertainment"] | ["Hodo"] | confident wrong |
| google/gemma-4-31b-it / 0 | "Bokutachi wa Benkyou ga Dekinai: In which season did it start? Return WINTER, SPRING, SUMMER, or FALL." | "SPRING" | "WINTER" | confident wrong |
| google/gemma-4-31b-it / 0 | "Magic Knight Rayearth II: In which season did it start? Return WINTER, SPRING, SUMMER, or FALL." | "SPRING" | "FALL" | confident wrong |
| google/gemma-4-31b-it / 0 | "Boku no Hero Academia 2: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 6 | 12 | confident wrong |
| google/gemma-4-31b-it / 0 | "Love Hina: Haru Special - Kimi Sakura Chiru Nakare!!: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 7 | 5 | confident wrong |
| google/gemma-4-31b-it / 0 | "Shingeki no Kyojin: How many episodes does this anime have? Return an integer." | 25 | 88 | confident wrong |
| google/gemma-4-31b-it / 0 | "Z/X IGNITION: Which main animation studio or studios are listed for this anime? Return a list of studio names." | ["Telecom Animation Film"] | ["Satelight"] | confident wrong |

## Arm B: 0 sampled of 0 incorrect question/model pairs

| Model / repeat | Question | Gold | Answer | Failure |
|---|---|---|---|---|
