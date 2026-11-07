# Sampled error analysis

Seed 20261106; up to ten incorrect observations per arm, sampled without replacement across unique question/model pairs.
Abstentions and parse failures are included as incorrect and labelled; no examples are fabricated when fewer are available.

## Arm A: 10 sampled of 106 incorrect question/model pairs

| Model / repeat | Question | Gold | Answer | Failure |
|---|---|---|---|---|
| glm-4.7-flash / 0 | "Isekai Oji-san: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 2 | 5 | confident wrong |
| glm-4.5-flash / 1 | "Z/X IGNITION: In which season did it start? Return WINTER, SPRING, SUMMER, or FALL." | "WINTER" | "SPRING" | confident wrong |
| glm-4.5-flash / 0 | "Fate/stay night [Heaven's Feel] II. lost butterfly: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 4 | 3 | confident wrong |
| glm-4.5-flash / 0 | "Tokyo Revengers: Chibi Reve: In which year did this anime start? Return a four-digit integer." | 2021 | 2022 | confident wrong |
| glm-4.5-flash / 0 | "Muchuu sa, Kimi ni.: In which year did this anime start? Return a four-digit integer." | 2025 | 2023 | confident wrong |
| glm-4.7-flash / 0 | "Magic Knight Rayearth II: In which season did it start? Return WINTER, SPRING, SUMMER, or FALL." | "SPRING" | "WINTER" | confident wrong |
| glm-4.7-flash / 0 | "Fate/stay night [Heaven's Feel] II. lost butterfly: In which year did this anime start? Return a four-digit integer." | 2019 | 2017 | confident wrong |
| glm-4.5-flash / 1 | "Tokyo Revengers: Chibi Reve: In which season did it start? Return WINTER, SPRING, SUMMER, or FALL." | "SPRING" | "WINTER" | confident wrong |
| glm-4.7-flash / 0 | "DRIFTERS: Which main animation studio or studios are listed for this anime? Return a list of studio names." | ["Hoods Entertainment"] | ["Production I.G"] | confident wrong |
| glm-4.5-flash / 0 | "Boku no Hero Academia 2: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 6 | 15 | confident wrong |

## Arm B: 1 sampled of 1 incorrect question/model pairs

| Model / repeat | Question | Gold | Answer | Failure |
|---|---|---|---|---|
| glm-4.7-flash / 0 | "Z/X IGNITION: How many character edges are labelled MAIN in this anime's AniList record? Return an integer." | 6 | 5 | confident wrong |
