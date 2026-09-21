const course = (name, slug, language, outline, platforms = "Android · iOS") => ({
  name, slug, language, outline, platforms,
});

export const mobileCourses = [
  course("React Native + Expo", "react-native-expo", "TypeScript / JavaScript", [
    ["Foundations and setup", "React Native and Expo architecture", "Project setup and device previews", "Components and project structure"],
    ["Building the interface", "Layouts and styling", "Navigation and state", "Forms and accessible interactions"],
    ["Device integration", "Camera and location", "Storage and API requests", "Permissions and notifications"],
    ["Testing and delivery", "Component and device testing", "Development and release builds", "Signing and store submission"],
  ]),
  course("Flutter", "flutter", "Dart", [
    ["Foundations and setup", "Dart essentials", "Flutter project setup", "Widgets and application lifecycle"],
    ["Building the interface", "Layouts and themes", "Navigation and state", "Responsive and accessible screens"],
    ["Device integration", "Plugins and platform channels", "Local data and networking", "Permissions and background work"],
    ["Testing and delivery", "Widget and integration tests", "Android and iOS builds", "Signing and store releases"],
  ]),
  course("Kotlin Multiplatform + Compose Multiplatform", "kotlin-compose-multiplatform", "Kotlin", [
    ["Foundations and setup", "Kotlin and coroutines", "Multiplatform project structure", "Shared and platform source sets"],
    ["Building the interface", "Compose UI fundamentals", "State and navigation", "Shared UI and platform adaptations"],
    ["Device integration", "Platform-specific implementations", "Networking and persistence", "Native API interoperability"],
    ["Testing and delivery", "Shared logic and UI testing", "Android and iOS build tooling", "Signing and distribution"],
  ]),
  course("React/Vite + Capacitor", "react-vite-capacitor", "TypeScript / JavaScript", [
    ["Foundations and setup", "React and Vite project setup", "Capacitor native projects", "Web assets and native synchronization"],
    ["Building the interface", "Mobile layouts and navigation", "Forms and state", "Safe areas and keyboard behavior"],
    ["Device integration", "Capacitor plugins", "Permissions and native APIs", "Offline data and networking"],
    ["Testing and delivery", "Browser and device testing", "Android Studio and Xcode workflows", "Signing and store releases"],
  ]),
  course("Ionic + Capacitor", "ionic-capacitor", "TypeScript / JavaScript", [
    ["Foundations and setup", "Ionic framework choices", "Project setup and structure", "Capacitor integration"],
    ["Building the interface", "Ionic components and themes", "Navigation and tabs", "Forms and validation"],
    ["Device integration", "Plugins and permissions", "Local storage and API requests", "Offline workflows"],
    ["Testing and delivery", "UI and device testing", "Native builds and debugging", "Store packaging and releases"],
  ]),
  course("NativeScript", "nativescript", "TypeScript / JavaScript", [
    ["Foundations and setup", "NativeScript runtime", "Project setup and framework choices", "Application lifecycle"],
    ["Building the interface", "Native controls and layouts", "Styling and navigation", "State and data binding"],
    ["Device integration", "Calling native APIs", "Plugins and permissions", "Networking and persistence"],
    ["Testing and delivery", "Testing and debugging", "Android and iOS builds", "Signing and store distribution"],
  ]),
  course(".NET MAUI", "dotnet-maui", "C# / XAML", [
    ["Foundations and setup", "C# and .NET essentials", "MAUI project structure", "Application lifecycle"],
    ["Building the interface", "XAML controls and layouts", "MVVM and data binding", "Shell navigation and styling"],
    ["Device integration", "Platform APIs and permissions", "Local data and web services", "Platform-specific code"],
    ["Testing and delivery", "View model and device tests", "Android and iOS build workflows", "Signing and publishing"],
  ]),
  course("Tauri 2 + React/Vite", "tauri-react-vite", "TypeScript + Rust", [
    ["Foundations and setup", "Tauri mobile architecture", "React and Vite setup", "Rust and mobile toolchains"],
    ["Building the interface", "Mobile web layouts", "Navigation and state", "Touch input and safe areas"],
    ["Device integration", "Rust commands and events", "Mobile plugins and native code", "Capabilities and permissions"],
    ["Testing and delivery", "Device testing and debugging", "Android and iOS builds", "Signing and distribution"],
  ]),
  course("Qt", "qt", "C++ / QML", [
    ["Foundations and setup", "Qt mobile toolchains", "C++ and QML project structure", "Application lifecycle"],
    ["Building the interface", "Qt Quick controls", "Touch layouts and navigation", "Models and signals"],
    ["Device integration", "Platform APIs and permissions", "Networking and local data", "Background work and resources"],
    ["Testing and delivery", "Mobile testing and profiling", "Android and iOS deployment", "Packaging and licensing considerations"],
  ]),
  course("PWA", "pwa", "HTML / CSS / JavaScript", [
    ["Foundations and setup", "Progressive enhancement", "Web app manifest", "HTTPS and browser support"],
    ["Building the interface", "Responsive layouts", "Touch and accessible navigation", "Installation experience"],
    ["Offline and device features", "Service worker lifecycle", "Caching and offline fallbacks", "Browser capabilities and permissions"],
    ["Testing and delivery", "Android and iOS browser testing", "Performance and accessibility", "Hosting and update lifecycle"],
  ], "Android browser · iOS browser"),
  course("Native Android + Native iOS", "native-android-ios", "Kotlin + Swift", [
    ["Foundations and setup", "Kotlin and Swift essentials", "Android Studio and Xcode", "Separate platform project structures"],
    ["Building the interface", "Jetpack Compose fundamentals", "SwiftUI fundamentals", "Platform navigation and state"],
    ["Device integration", "Native APIs and permissions", "Persistence and networking", "Lifecycle and background work"],
    ["Testing and delivery", "Platform unit and UI tests", "Signing and provisioning", "Play Store and App Store releases"],
  ]),
  course("Unity / Godot", "unity-godot", "C# / C++ / GDScript", [
    ["Foundations and setup", "Choosing an engine", "Scenes and project structure", "Scripting fundamentals"],
    ["Building the experience", "2D and 3D scenes", "Touch controls and UI", "Animation, physics, and audio"],
    ["Mobile integration", "Save data and platform services", "Device input and permissions", "Memory and rendering performance"],
    ["Testing and delivery", "Device testing and profiling", "Android and iOS export workflows", "Signing and store distribution"],
  ]),
];
