function findCurrentEvent() {
    var browserCurrent = studio.window.browserCurrent();

    if (browserCurrent && browserCurrent.isOfType("Event")) {
        return browserCurrent;
    }

    var editorCurrent = studio.window.editorCurrent();

    if (!editorCurrent) {
        return null;
    }

    if (editorCurrent.isOfType("Sound")) {
        return editorCurrent.audioTrack.event;
    }

    if (editorCurrent.isOfType("Track")) {
        return editorCurrent.event;
    }

    return null;
}

function executor() {
    var currentEvent = findCurrentEvent();

    if (!currentEvent) {
        return;
    }

    var tracks = currentEvent.groupTracks.slice();

    tracks.sort(function (a, b) {
        var firstA = firstSound(a);
        var firstB = firstSound(b);
        if (!firstB) {
            return -1;
        }
        if (!firstA) {
            return 1;
        }
        return firstA.start < firstB.start
            ? -1
            : firstA.start > firstB.start
                ? 1
                : 0;
    });

    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        if (track.mixerGroup.name.indexOf("Audio ") === 0) {
            track.mixerGroup.properties.name.setValue(firstSoundName(track));
        }
        currentEvent.relationships.groupTracks.insert(i, tracks[i]);
    }
}

function firstSound(track) {
    var first = null;
    var sounds = trackSounds(track);
    for (var i = 0; i < sounds.length; i++) {
        if (!first || sounds[i].start < first.start) {
            first = sounds[i];
        }
    }
    return first;
}

function firstSoundName(track) {
    function nameFromPath(path) {
        path = path.slice(path.lastIndexOf("/") + 1, path.length);
        console.log(path);
        if (path.indexOf(".") !== -1) {
            path = path.slice(0, path.lastIndexOf("."));
            console.log("(" + path + ")");
        }
        var split = path.split("-");
        console.log(split);
        for (var i = split.length - 1; i > 0; i--) {
            if (isNaN(Number(split[i]))) {
                return split[i];
            }
        }
        return split[0];
    }

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

    var first = firstSound(track);
    if (!first) {
        return track.mixerGroup.name;
    }

    var name = soundName(first);
    if (name) {
        return name;
    }

    console.log("name not found");
    return track.mixerGroup.name;
}

function trackSounds(track) {
    var items = [];
    for (var i = 0; i < track.modules.length; i++) {
        if (track.modules[i].isOfType("Sound")) {
            items.push(track.modules[i]);
        }
    }
    return items;
}

studio.menu.addMenuItem({
    name: "Sort Tracks",
    execute: executor,
    keySequence: "F10",
});