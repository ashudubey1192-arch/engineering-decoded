const course = (name, slug, language, outline) => ({ name, slug, language, outline });

export const desktopCourses = [
  course("Tauri + React/Vite", "tauri-react-vite", "React / TypeScript + Rust", [
    ["Foundations and setup", "Tauri architecture", "Rust toolchain and Vite project", "Project structure"],
    ["Building the interface", "React components and layouts", "Navigation and state", "Desktop window design"],
    ["Native integration", "Rust commands and events", "Files and local storage", "Capabilities and permissions"],
    ["Testing and delivery", "Testing and debugging", "Platform builds and signing", "Installers and updates"],
  ]),
  course("Electron + React", "electron-react", "React / TypeScript + Node.js", [
    ["Foundations and setup", "Main and renderer processes", "React project setup", "Application lifecycle"],
    ["Building the interface", "React views and state", "Windows and navigation", "Menus and keyboard shortcuts"],
    ["Native integration", "Preload scripts and IPC", "Files and persistence", "Context isolation and security"],
    ["Testing and delivery", "Testing and debugging", "Packaging and signing", "Updates and performance"],
  ]),
  course("Flutter", "flutter", "Dart", [
    ["Foundations and setup", "Dart essentials", "Desktop project setup", "Widgets and application structure"],
    ["Building the interface", "Layouts and theming", "State and navigation", "Keyboard and pointer interactions"],
    ["Native integration", "Plugins and platform channels", "Files and local data", "Window management"],
    ["Testing and delivery", "Widget and integration tests", "Desktop builds and distribution", "Sharing UI with mobile"],
  ]),
  course("Qt", "qt", "C++ / QML / Python", [
    ["Foundations and setup", "Qt ecosystem and toolchain", "C++ and Python entry paths", "Project structure"],
    ["Building the interface", "Widgets and Qt Quick", "QML layouts and styling", "Signals, slots, and models"],
    ["Native integration", "Files and databases", "Threads and background tasks", "Platform integration"],
    ["Testing and delivery", "Testing and debugging", "Resources and deployment", "Packaging and licensing considerations"],
  ]),
  course("Avalonia", "avalonia", "C# / .NET", [
    ["Foundations and setup", ".NET and C# essentials", "Avalonia project setup", "Application lifecycle"],
    ["Building the interface", "XAML controls and layouts", "Bindings and MVVM", "Styles and themes"],
    ["Native integration", "Commands and navigation", "Files and local persistence", "Async work and platform services"],
    ["Testing and delivery", "View model and UI tests", "Publishing desktop builds", "Packaging and distribution"],
  ]),
  course("JavaFX", "javafx", "Java / Kotlin", [
    ["Foundations and setup", "JVM and JavaFX setup", "Maven or Gradle project", "Application lifecycle"],
    ["Building the interface", "Scenes, controls, and layouts", "FXML and controllers", "CSS, properties, and bindings"],
    ["Native integration", "Events and navigation", "Files and database access", "Tasks and the UI thread"],
    ["Testing and delivery", "Testing and debugging", "Runtime images with jlink", "Installers with jpackage"],
  ]),
];
