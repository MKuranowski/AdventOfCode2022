See <https://adventofcode.com/2022/> for a list of tasks.

This time: TypeScript and the Deno runtime.

Day-specific notes:
- Input format for day 5 has been turned sideways, for easier parsing.
- Day 15 doesn't parse input; it's hardcoded in the program.
- Day 16 was completely fucked up. Especially for part B,
    which is a brute force in order of 2**16, I needed the code to run as fast as possible.  
    That's why it's written in Rust, while a small part (graph "compression") is written in TS.

    Still, the solver for part 2 needs 6 seconds to run, at least on my modern PC.
