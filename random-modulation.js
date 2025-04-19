function executor(property, increase) {
    return function () {
        studio.window.editorSelection().forEach(function (inst) {
            if (!inst || !inst.isOfType("Sound")) {
                return;
            }

            var mod = inst.modulators.find(function (m) {
                return m.isOfType("RandomizerModulator") && m.nameOfPropertyBeingModulated === property;
            });

            if (!mod) {
                if (!increase) {
                    return;
                }
                mod = inst.addModulator("RandomizerModulator", property);
            } else if (property == "startOffset") {
                studio.project.deleteObject(mod);
                inst.properties.startOffset.setValue(0);
                return;
            }

            var newValue = increase
                ? Math.floor(mod.properties.amount.value + 1)
                : Math.ceil(mod.properties.amount.value - 1);

            if (property == "startOffset") {
                newValue = 100;
                inst.properties.startOffset.setValue(50);
            }

            if (newValue <= 0) {
                studio.project.deleteObject(mod);
            } else {
                mod.properties.amount.setValue(newValue);
            }
        });
    };
}

studio.menu.addMenuItem({
    name: "Modulate Random: Pitch+",
    execute: executor("pitch", true),
    keySequence: "Ctrl+Alt+P",
});

studio.menu.addMenuItem({
    name: "Modulate Random: Pitch-",
    execute: executor("pitch", false),
    keySequence: "Ctrl+Alt+O",
});

studio.menu.addMenuItem({
    name: "Modulate Random: Volume+",
    execute: executor("volume", true),
    keySequence: "Ctrl+Alt+V",
});

studio.menu.addMenuItem({
    name: "Modulate Random: Volume-",
    execute: executor("volume", false),
    keySequence: "Ctrl+Alt+C",
});

studio.menu.addMenuItem({
    name: "Modulate Random: Start Offset",
    execute: executor("startOffset", true),
    keySequence: "Ctrl+Alt+X",
});
