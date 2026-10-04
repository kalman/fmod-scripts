function hasGainAutomator(obj) {
    return obj.automators && obj.automators.length > 0;
}

function containsVolumeAutomation(automators) {
    if (automators) {
        for (var i = 0; i < automators.length; i++) {
            var automator = automators[i];

            if (automator.isOfType("AutomationTrack")) {
                automator = automator.automator;
            }

            if (automators[i].nameOfPropertyBeingAutomated == "volume") {
                return true;
            }
        }
    }

    return false;
}

function addGain(obj, delta) {
    var prop;

    if (obj.isOfType("GainEffect") && !hasGainAutomator(obj)) {
        prop = obj.properties.gain;
    } else if (obj.isOfType("MixerSend") && !hasGainAutomator(obj)) {
        prop = obj.properties.level;
    } else if (obj.isOfType("Sound") && !containsVolumeAutomation(obj.automators)) {
        prop = obj.properties.volume;
    } else if (obj.isOfType("Track") && !containsVolumeAutomation(obj.mixerGroup.automationTracks)) {
        prop = obj.mixerGroup.properties.volume;
    }

    if (!prop) {
        console.log("skipping, property not found");
        return;
    }

    var quantValue = Math.round((prop.value + delta) / 3);
    console.log("found object with gain value " + prop.value);
    prop.setValue(quantValue * 3);
}

function executor(delta) {
    return function () {
        if (studio.window.deckCurrent()) {
            studio.window.deckSelection().forEach(function (sel) {
                addGain(sel, delta);
            });
        }
        else if (studio.window.editorCurrent()) {
            studio.window.editorSelection().forEach(function (sel) {
                addGain(sel, delta);
            });
        }
        else if (studio.window.browserCurrent()) {
            addGain(studio.window.browserCurrent().masterTrack, delta);
        }
    }
}

studio.menu.addMenuItem({
    name: "Gain\\+3db",
    execute: executor(3),
    keySequence: "Ctrl+Alt+=",
});

studio.menu.addMenuItem({
    name: "Gain\\-3db",
    execute: executor(-3),
    keySequence: "Ctrl+Alt+-",
});
