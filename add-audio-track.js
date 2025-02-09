function executor(above) {
    return function () {
        const event = studio.window.browserCurrent();
        var belowTrack = studio.window.editorCurrent();

        if (belowTrack == null) {
            belowTrack = event.groupTracks[event.groupTracks.length - 1];
        } else if (belowTrack.isOfType("Sound")) {
            belowTrack = belowTrack.audioTrack;
        } else if (!belowTrack.isOfType("Track")) {
            return;
        }

        var newTrack = event.addGroupTrack("Audio " + (event.groupTracks.length + 1));
        event.relationships.groupTracks.remove(newTrack);

        for (var i = 0; i < event.groupTracks.length; i++) {
            if (event.groupTracks[i].id === belowTrack.id) {
                event.relationships.groupTracks.insert(i + (above ? 1 : 0), newTrack);
                break;
            }
        }
    };
}

studio.menu.addMenuItem({
    name: "Add Audio Track Above",
    execute: executor(false),
    keySequence: "Alt+Shift+T",
});

studio.menu.addMenuItem({
    name: "Add Audio Track Below",
    execute: executor(true),
    keySequence: "Alt+T",
});