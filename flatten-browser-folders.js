function execute() {
    studio.window.triggerAction(studio.window.actions.FlattenBrowserFolders);
}

studio.menu.addMenuItem({
    name: "UI\\Flatten Browser Folders",
    execute: execute,
    keySequence: "Meta+F",
});