var colors = [
    "Blue",
    "Yellow",
    "Purple",
    "Green",
    "Magenta",
    "Cyan",
    "Red",
];

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

function executor(forceRename) {
    var currentEvent = findCurrentEvent();

    if (!currentEvent) {
        return;
    }

    var tracks = currentEvent.groupTracks.slice();
    var trackIdMap = {};
    var groupedTracks = {};
    var groupedTrackOrder = [];
    var sendToMasterTracks = [];

    tracks.forEach(function (track) {
        trackIdMap[track.id] = track;
        var output = track.mixerGroup.output;

        if (output.isOfType("EventMixerMaster")) {
            sendToMasterTracks.push(track);
        } else {
            var outputId = output.groupTrack.id;

            if (!(outputId in groupedTracks)) {
                groupedTrackOrder.push(outputId);
                groupedTracks[outputId] = [];
            }
            groupedTracks[outputId].push(track);
        }
    });

    var colorIndex = 0;

    for (var id in groupedTracks) {
        var color = colors[colorIndex];
        colorIndex++;

        trackIdMap[id].mixerGroup.properties.color.setValue(color);

        var childTracks = groupedTracks[id];
        sortTracks(childTracks);
        childTracks.forEach(function (childTrack) {
            childTrack.mixerGroup.properties.color.setValue(color + " Light 1");
        });
    }

    for (var i = 0; i < sendToMasterTracks.length; i++) {
        if (sendToMasterTracks[i].id in groupedTracks) {
            sendToMasterTracks.splice(i, 1);
            i--;
        }
    }

    sortTracks(sendToMasterTracks);

    var trackOrder = [];

    for (var i = 0; i < groupedTrackOrder.length; i++) {
        var groupId = groupedTrackOrder[i];
        trackOrder.push(trackIdMap[groupId]);
        trackOrder = trackOrder.concat(groupedTracks[groupId]);
    }

    trackOrder = trackOrder.concat(sendToMasterTracks);

    for (var i = 0; i < trackOrder.length; i++) {
        var track = trackOrder[i];
        if (track.mixerGroup.name.indexOf("Audio ") === 0 || forceRename) {
            track.mixerGroup.properties.name.setValue(firstSoundName(track));
        }
        currentEvent.relationships.groupTracks.insert(i, trackOrder[i]);
    }
}

function sortTracks(tracks) {
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
        if (path.indexOf(".") !== -1) {
            path = path.slice(0, path.lastIndexOf("."));
        }
        var split = path.split(/[-_]/);
        var endIndex = split.length - 1;
        while (endIndex > 0) {
            if (isNaN(Number(split[endIndex]))) {
                break;
            }
            endIndex--;
        }
        var startIndex = Math.min(endIndex, 2);
        var length = 0;
        split = split.map(capitalize);
        for (var i = endIndex; i >= startIndex; i--) {
            length += split[i].length;
            if (length >= 10) {
                startIndex = i + 1;
                break;
            }
        }
        return split.slice(startIndex, endIndex + 1).join("");
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
        if (item.isOfType("EventSound")) {
            studio.item = item;
            return nameFromPath(item.event.name);
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

function capitalize(string) {
    string = string.replace(/[0-9]/g, '')

    if (string.length == 0)
        return string;

    return string[0].toUpperCase() + string.slice(1);
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
    name: "Sort Tracks\\Default",
    execute: executor,
    keySequence: "F10",
});

studio.menu.addMenuItem({
    name: "Sort Tracks\\Force Rename",
    execute: function () { executor(true); },
    keySequence: "F11",
});