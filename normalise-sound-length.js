function soundName(item) {
    if (item.isOfType("SingleSound")) {
        return item.audioFile.assetPath; // nameFromPath(item.audioFile.assetPath);
    }

    if (item.isOfType("MultiSound")) {
        for (var i = 0; i < item.sounds.length; i++) {
            var name = soundName(item.sounds[i]);
            if (name) {
                return "MultiSound[0]:" + name;
            }
        }
        return null;
    }

    if (item.isOfType("SoundScatterer")) {
        return soundName(item.sound);
    }

    return null;
}

function soundLength(inst) {
    if (inst.isOfType("SingleSound")) {
        return applyModulators(inst, inst.audioFile.length);
    }

    if (inst.isOfType("MultiSound")) {
        var lengths = inst.sounds.map(soundLength);
        var minOrMax = Math.max.apply(null, lengths);
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

studio.menu.addMenuItem({
    name: "Instrument\\Normalise Length",
    execute: function () {
        studio.window.editorSelection().forEach(function (inst) {
            if (inst) {
                inst.properties.length.setValue(soundLength(inst));
            }
        });
    },
    keySequence: "=",
});
