function findCurrentEvent() {
    function findTopLevel(event) {
        while (event.folder && event.folder.isOfType("Event")) {
            event = event.folder;
        }
        return event;
    }

    var browserCurrent = studio.window.browserCurrent();

    if (browserCurrent && browserCurrent.isOfType("Event")) {
        return findTopLevel(browserCurrent);
    }

    var editorCurrent = studio.window.editorCurrent();

    if (!editorCurrent) {
        return null;
    }

    if (editorCurrent.isOfType("Sound")) {
        return findTopLevel(editorCurrent.audioTrack.event);
    }

    if (editorCurrent.isOfType("Track")) {
        return findTopLevel(editorCurrent.event);
    }

    return null;
}

function execute() {
    const currentEvent = findCurrentEvent();
    const banks = studio.project.workspace.masterBankFolder.items;
    const buildBanks = [];

    for (var i = 0; i < banks.length; i++) {
        const bank = banks[i];
        if (!bank.events)
        {
            continue;
        }
        for (var j = 0; j < bank.events.length; j++) {
            const bankEvent = bank.events[j];
            if (bankEvent.id === currentEvent.id) {
                buildBanks.push(bank.name);
                continue;
            }
        }
    }

    if (buildBanks.length > 0) {
        studio.project.build({ banks: buildBanks });
    } else {
        console.log("no banks found");
    }
}

studio.menu.addMenuItem({
    name: "Build Banks for Event",
    execute: execute,
    keySequence: "F8",
});