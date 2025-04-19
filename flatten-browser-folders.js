function execute() {
    studio.window.triggerAction(studio.window.actions.FlattenBrowserFolders);
}

studio.menu.addMenuItem({
    name: "Flatten Browser Folders",
    execute: execute,
    keySequence: "F",
});