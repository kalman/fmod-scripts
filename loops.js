function toggleAsyncCutLoop() {
    studio.window.editorSelection().forEach(function (inst) {
        if (!inst || !inst.isOfType("Sound")) {
            return;
        }
        var newValue = !(inst.isAsync && inst.isCutoff && inst.looping);
        inst.properties.isAsync.setValue(newValue);
        inst.properties.isCutoff.setValue(newValue);
        inst.properties.looping.setValue(newValue);
    });
}

studio.menu.addMenuItem({
    name: "Loops: Toggle Async+Cut+Loop",
    execute: toggleAsyncCutLoop,
    keySequence: "Alt+L",
});
