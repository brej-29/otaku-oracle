# Sampled error analysis

Seed 20261106; up to ten incorrect observations per arm, sampled without replacement across unique question/model pairs.
Abstentions and parse failures are included as incorrect and labelled; no examples are fabricated when fewer are available.

## Arm A: 1 sampled of 1 incorrect question/model pairs

| Model / repeat | Question | Gold | Answer | Failure |
|---|---|---|---|---|
| glm-4.7-flash / 0 | "Magic Knight Rayearth II: In which season did it start? Return WINTER, SPRING, SUMMER, or FALL." | "SPRING" | "WINTER" | confident wrong |

## Arm B: 0 sampled of 0 incorrect question/model pairs

| Model / repeat | Question | Gold | Answer | Failure |
|---|---|---|---|---|
