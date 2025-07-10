function soundName(item) {
    if (item.isOfType("SingleSound")) {
        return nameFromPath(item.audioFile.assetPath);
    }
    if (item.isOfType("MultiSound")) {
        for (var i = 0; i < item.sounds.length; i++) {
            var name = soundName(item.sounds[i]);
            if (name) {
                return name;
            }
        }
        return null;
    }
    if (item.isOfType("SoundScatterer")) {
        return soundName(item.sound);
    }
    return null;
}

function soundLength(inst, minLength) {
    if (inst.isOfType("SingleSound")) {
        return applyModulators(inst, inst.audioFile.length);
    }

    if (inst.isOfType("MultiSound")) {
        var lengths = inst.sounds.map(function (sound) {
            return soundLength(sound, minLength);
        });
        var minOrMax = (minLength ? Math.min : Math.max).apply(undefined, lengths);
        return applyModulators(inst, minOrMax);
    }

    return -1;
}

function applyModulators(inst, length) {
    var mod = inst.modulators.find(function (m) {
        return m.isOfType("RandomizerModulator") && m.nameOfPropertyBeingModulated === "pitch";
    });

    var pitch = inst.pitch;

    if (mod) {
        pitch -= mod.amount / 2.0833334922790527 / 2;
    }

    return length / Math.pow(2, pitch / 12);
}

function executor(minLength) {
    return function () {
        studio.window.editorSelection().forEach(function (inst) {
            if (inst) {
                inst.properties.length.setValue(soundLength(inst, minLength));
            }
        });
    };
}

studio.menu.addMenuItem({
    name: "Sound Length: Normalise (Max Length)",
    execute: executor(false),
    keySequence: "=",
});
