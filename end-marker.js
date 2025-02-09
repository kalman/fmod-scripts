function executor(forward) {
    return function () {
        const event = studio.window.browserCurrent();
        var endInstPosition = 0;

        for (var i = 0; i < event.groupTracks.length; i++) {
            for (var j = 0; j < event.groupTracks[i].modules.length; j++) {
                const inst = event.groupTracks[i].modules[j];
                if (inst.isOfType("Sound")) {
                    endInstPosition = Math.max(endInstPosition, inst.start + inst.length);
                }
            }
        }

        var markerTrack = null;
        var endMarker = null;

        for (var i = 0; i < event.markerTracks.length; i++) {
            markerTrack = event.markerTracks[i];
            for (var j = 0; j < markerTrack.markers.length; j++) {
                const marker = markerTrack.markers[j];
                if (marker.isOfType("NamedMarker") && marker.name === "End") {
                    endMarker = marker;
                    break;
                }
            }
        }

        if (endMarker === null) {
            if (markerTrack === null) {
                markerTrack = event.addMarkerTrack();
            }
            endMarker = markerTrack.addNamedMarker("End", endInstPosition);
        } else {
            var endMarkerPosition = endInstPosition;
            while (endMarkerPosition <= endMarker.position) {
                endMarkerPosition *= 2;
            }
            if (forward) {
                endMarker.position = endMarkerPosition;
            } else {
                endMarker.position = Math.max(endInstPosition, endMarkerPosition / 4);
            }
        }

        studio.window.triggerAction(studio.window.actions.ZoomToFit);
    };
}

studio.menu.addMenuItem({
    name: "Move End Marker+",
    execute: executor(true),
    keySequence: "Alt+E",
});

studio.menu.addMenuItem({
    name: "Move End Marker-",
    execute: executor(false),
    keySequence: "Alt+W",
});