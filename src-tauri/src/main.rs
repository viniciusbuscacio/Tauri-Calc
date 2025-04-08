#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Use the calc_lib library (defined in lib.rs)
use calc_lib;

fn main() {
    calc_lib::run(); // Call the run function defined in lib.rs
}