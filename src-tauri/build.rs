fn main() {
    // Flag to help with conditional compilation for Linux
    #[cfg(target_os = "linux")]
    {
        println!("cargo:rustc-cfg=target_os_linux");
        println!("cargo:warning=Building for Linux - disabling menu");
    }
    
    tauri_build::build()
}
