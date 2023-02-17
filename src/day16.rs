// Copyright (c) 2022-2023 Mikołaj Kuranowski
// SPDX-License-Identifier: WTFPL

use std::collections::HashMap;
use std::iter::FromIterator;

// Base data types

type ValveID = u8;

#[derive(Debug, Clone)]
struct Valve {
    adjacent: Vec<(ValveID, i32)>,
    flow_rate: i32,
}

type Graph = HashMap<ValveID, Valve>;

// Graph loading

fn load_graph() -> Graph {
    let stdin = std::io::stdin();
    let mut graph = Graph::new();
    let mut line = String::new();

    loop {
        // Read the next line
        line.clear();
        let read = stdin.read_line(&mut line).unwrap();
        if read == 0 {
            break;
        }

        // Line format: valve_id:flow_rate:adjacent_valve-cost,...
        let mut split = line.trim_end_matches('\n').split(':');

        // Convert the valve ID
        let valve_id = split
            .next()
            .expect("missing valve id")
            .parse::<ValveID>()
            .unwrap();

        // Convert the flow rate
        let flow_rate = split
            .next()
            .expect("missing flow rate")
            .parse::<i32>()
            .unwrap();

        // Convert the pairs of adjacent nodes
        let mut adjacent: Vec<(ValveID, i32)> = Vec::new();
        let adjacent_pairs = split.next().expect("missing adjacent nodes");
        for adjacent_pair in adjacent_pairs.split(',') {
            let mut pair_split = adjacent_pair.split('-');

            let adj_valve_id = pair_split.next().unwrap().parse::<ValveID>().unwrap();
            let cost = pair_split.next().unwrap().parse::<i32>().unwrap();

            adjacent.push((adj_valve_id, cost));
        }

        graph.insert(
            valve_id,
            Valve {
                adjacent,
                flow_rate,
            },
        );
    }

    return graph;
}

fn all_openable_valves_in_graph(g: &Graph) -> BitSet {
    let mut set = 0u64;
    for (&x, _) in g {
        if x != 0 {
            set = bitset_with_added(set, x);
        }
    }
    return set;
}

// Bitset helpers

type BitSet = u64;

fn bitset_has(set: BitSet, x: u8) -> bool {
    return set & (1 << x) != 0;
}

fn bitset_with_added(set: BitSet, x: u8) -> BitSet {
    return set | (1 << x);
}

// Search stuff

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
struct SearchState {
    opened: BitSet,
    time_left: i32,
    pos: ValveID,
}

#[derive(Debug)]
struct Search<'a> {
    lookup: HashMap<SearchState, i32>,
    g: &'a Graph,
}

impl Search<'_> {
    fn run(&mut self, state: SearchState) -> i32 {
        // Check if run out of time
        if state.time_left <= 0 {
            return 0;
        }

        // Check in cache
        if let Some(cached) = self.lookup.get(&state) {
            return *cached;
        }

        // Find the best solution recursively
        let mut best: i32 = 0;
        let data = self.g.get(&state.pos).expect("invalid node");

        for (adjacent_valve, cost) in &data.adjacent {
            // Don't reopen valves
            if bitset_has(state.opened, *adjacent_valve) {
                continue;
            }

            // See the gain for opening the valve
            let time_open = state.time_left - cost - 1;
            if time_open <= 0 {
                continue;
            }
            let gain = time_open * self.g.get(&adjacent_valve).unwrap().flow_rate;

            // See if this path leads to a better solution
            let result = gain
                + self.run(SearchState {
                    opened: bitset_with_added(state.opened, *adjacent_valve),
                    time_left: state.time_left - cost - 1,
                    pos: *adjacent_valve,
                });

            if result > best {
                best = result;
            }
        }

        // Cache the solution and return
        self.lookup.insert(state, best);
        return best;
    }
}

// Generator of possible setups

#[derive(Debug, Clone)]
struct SetupGenerator {
    available_valves: Vec<ValveID>,
    current_combination: BitSet,
    done: bool,
}

impl SetupGenerator {
    fn new(g: &Graph) -> SetupGenerator {
        SetupGenerator {
            available_valves: Vec::from_iter(g.keys().map(|&v| v).filter(|&v| v != 0)),
            current_combination: 0,
            done: false,
        }
    }
}

impl Iterator for SetupGenerator {
    type Item = BitSet;

    fn next(&mut self) -> Option<Self::Item> {
        if self.done {
            return None;
        }

        // Generate the combination
        let mut opened: BitSet = 0;
        for (idx, &valve_id) in self.available_valves.iter().enumerate() {
            if bitset_has(self.current_combination, idx as u8) {
                opened = bitset_with_added(opened, valve_id);
            }
        }

        // Advance the combination
        self.current_combination += 1;
        if bitset_has(self.current_combination, self.available_valves.len() as u8) {
            self.done = true;
        }

        // Return the prepared combination
        return Some(opened);
    }
}

fn main_part_a(g: &Graph) {
    let mut s = Search {
        lookup: HashMap::new(),
        g: g,
    };
    let initial_state = SearchState {
        opened: 0,
        time_left: 30,
        pos: 0,
    };
    let score = s.run(initial_state);
    println!("{score}");
}

fn main_part_b(g: &Graph) {
    // Run the part A solver for every subset of valves (around 2**15).
    // To keep the code reusable, "unavailable" valves are marked as opened.
    let mut score_with_closed: HashMap<u64, i32> = HashMap::new();
    for ignored_valves in SetupGenerator::new(g) {
        let mut s = Search {
            lookup: HashMap::new(),
            g: g,
        };
        let initial_state = SearchState {
            opened: ignored_valves,
            time_left: 26,
            pos: 0,
        };
        let score = s.run(initial_state);

        score_with_closed.insert(ignored_valves, score);
    }

    // Find a pair of solutions which don't share opened valves
    // And has the best sum of scores
    let openable_valves = all_openable_valves_in_graph(&g);
    let mut best = 0;
    for (&a_ignored_valves, &a_score) in score_with_closed.iter() {
        for (&b_ignored_valves, &b_score) in score_with_closed.iter() {
            let a_opened_valves = !a_ignored_valves & openable_valves;
            let b_opened_valves = !b_ignored_valves & openable_valves;

            if a_opened_valves & b_opened_valves != 0 {
                // Solutions share opened valves - ignore it
                continue;
            } else {
                let score = a_score + b_score;
                if score > best {
                    best = score
                }
            }
        }
    }

    println!("{best}");
}

fn main() {
    let g = load_graph();
    let part = std::env::args().nth(1).unwrap_or("".to_string());

    if part == "a" {
        main_part_a(&g);
    } else if part == "b" {
        main_part_b(&g);
    } else {
        eprintln!("Invalid part: {part}");
        std::process::exit(1);
    }
}
