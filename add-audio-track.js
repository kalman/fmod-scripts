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

function executor(above) {
    return function () {
        var currentTrack = studio.window.editorCurrent();

        if (currentTrack == null) {
            var currentEvent = findCurrentEvent();
            if (currentEvent) {
                currentTrack = currentEvent.groupTracks[event.groupTracks.length - 1];
            }
        } else if (currentTrack.isOfType("Sound")) {
            currentTrack = currentTrack.audioTrack;
        } else if (!currentTrack.isOfType("Track")) {
            return;
        }

        if (currentTrack.entity == "MasterTrack") {
            return;
        }

        const event = currentTrack.event;
        var newTrack = event.addGroupTrack("Audio " + (event.groupTracks.length + 1));

        event.relationships.groupTracks.remove(newTrack);

        for (var i = 0; i < event.groupTracks.length; i++) {
            if (event.groupTracks[i].id === currentTrack.id) {
                event.relationships.groupTracks.insert(i + (above ? 1 : 0), newTrack);
                break;
            }
        }
    };
}

studio.menu.addMenuItem({
    name: "Add Audio Track: Above",
    execute: executor(false),
    keySequence: "Alt+Shift+T",
});

studio.menu.addMenuItem({
    name: "Add Audio Track: Below",
    execute: executor(true),
    keySequence: "Alt+T",
});