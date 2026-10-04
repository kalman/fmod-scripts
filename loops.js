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

function hasLoopRegion(markerTrack) {
    for (var i = 0; i < markerTrack.markers.length; i++) {
        if (markerTrack.markers[i].isOfType("LoopRegion")) {
            return true;
        }
    }
    return false;
}

function createLoop() {
    var instruments = studio.window.editorSelection().filter(function(inst) {
        return inst && inst.isOfType("Sound") && inst.parameter && inst.parameter.isOfType("Timeline");
    });

    if (instruments.length === 0) {
        return;
    }

    var startTimes = instruments.map(function(inst) {
        return inst.start;
    });

    var endTimes = instruments.map(function(inst) {
        return inst.start + inst.length;
    });

    var minStartTime = Math.min.apply(null, startTimes);
    var maxEndTime = Math.max.apply(null, endTimes);

    var event = instruments[0].audioTrack.event;
    var markerTrack = null;

    for (var i = 0; i < event.markerTracks.length; i++) {
        if (hasLoopRegion(event.markerTracks[i])) {
            markerTrack = event.markerTracks[i];
            break;
        }
    }

    if (markerTrack === null) {
        markerTrack = event.addMarkerTrack();
    }

    markerTrack.addRegion(minStartTime, maxEndTime - minStartTime, "", studio.project.regionLoopMode.Looping);
}

studio.menu.addMenuItem({
    name: "Instrument\\Toggle Async + Cut + Loop",
    execute: toggleAsyncCutLoop,
    keySequence: "Alt+L",
});

studio.menu.addMenuItem({
    name: "Instrument\\Create Loop",
    execute: createLoop,
    keySequence: "Alt+Meta+L",
});
