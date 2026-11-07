# Sampled error analysis

Seed 20261106; up to ten incorrect observations per arm, sampled without replacement across unique question/model pairs.
Abstentions and parse failures are included as incorrect and labelled; no examples are fabricated when fewer are available.

## Arm A: 10 sampled of 57 incorrect question/model pairs

| Model / repeat | Question | Gold | Answer | Failure |
|---|---|---|---|---|
| openai/gpt-oss-120b / 0 | "Muchuu sa, Kimi ni.: How many episodes does this anime have? Return an integer." | 5 | 1 | wrong |
| openai/gpt-oss-120b / 0 | "Musaigen no Phantom World: How many episodes does this anime have? Return an integer." | 13 | 12 | confident wrong |
| openai/gpt-oss-120b / 0 | "Tokyo Revengers: Chibi Reve: Which main animation studio or studios are listed for this anime? Return a list of studio names." | ["Studio PuYUKAI"] | ["Studio Pierrot"] | confident wrong |
| openai/gpt-oss-120b / 0 | "Isekai Oji-san: Which main animation studio or studios are listed for this anime? Return a list of studio names." | ["Atelier Pontdarc"] | ["Satelight"] | wrong |
| openai/gpt-oss-120b / 0 | "Magic Knight Rayearth II: What is its AniList format? Return the enum (TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA, MUSIC, or MANGA)." | "TV" | "OVA" | confident wrong |
| openai/gpt-oss-120b / 0 | "Magic Knight Rayearth II: In which season did it start? Return WINTER, SPRING, SUMMER, or FALL." | "SPRING" | "FALL" | wrong |
| openai/gpt-oss-120b / 0 | "Tengen Toppa Gurren Lagann: Parallel Works: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 0 | null | abstention |
| openai/gpt-oss-120b / 0 | "Boku no Hero Academia 4: In which year did this anime start? Return a four-digit integer." | 2019 | 2016 | confident wrong |
| openai/gpt-oss-120b / 0 | "Love Hina: Haru Special - Kimi Sakura Chiru Nakare!!: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 7 | null | abstention |
| openai/gpt-oss-120b / 0 | "DEATH NOTE: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 9 | null | abstention |

## Arm B: 0 sampled of 0 incorrect question/model pairs

| Model / repeat | Question | Gold | Answer | Failure |
|---|---|---|---|---|
