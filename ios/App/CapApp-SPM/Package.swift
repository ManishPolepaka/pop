// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.0.2"),
        .package(name: "CapacitorFirebaseAuthentication", path: "..\..\..\node_modules\@capacitor-firebase\authentication"),
        .package(name: "CapacitorApp", path: "..\..\..\node_modules\@capacitor\app"),
        .package(name: "CapacitorLocalNotifications", path: "..\..\..\node_modules\@capacitor\local-notifications"),
        .package(name: "CordovaPluginBrowsertab", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginBrowsertab"),
        .package(name: "CordovaPluginBuildinfo", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginBuildinfo"),
        .package(name: "CordovaPluginCustomurlscheme", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginCustomurlscheme"),
        .package(name: "CordovaPluginInappbrowser", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginInappbrowser"),
        .package(name: "CordovaUniversalLinksPluginFix", path: "../../capacitor-cordova-ios-plugins/sources/CordovaUniversalLinksPluginFix")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorFirebaseAuthentication", package: "CapacitorFirebaseAuthentication"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorLocalNotifications", package: "CapacitorLocalNotifications"),
                .product(name: "CordovaPluginBrowsertab", package: "CordovaPluginBrowsertab"),
                .product(name: "CordovaPluginBuildinfo", package: "CordovaPluginBuildinfo"),
                .product(name: "CordovaPluginCustomurlscheme", package: "CordovaPluginCustomurlscheme"),
                .product(name: "CordovaPluginInappbrowser", package: "CordovaPluginInappbrowser"),
                .product(name: "CordovaUniversalLinksPluginFix", package: "CordovaUniversalLinksPluginFix")
            ]
        )
    ]
)
