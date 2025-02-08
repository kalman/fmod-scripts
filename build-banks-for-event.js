function execute() {
    const event = studio.window.browserCurrent();
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
            if (bankEvent.id === event.id) {
                buildBanks.push(bank.name);
                continue;
            }
        }
    }

    if (buildBanks.length > 0) {
        studio.project.build({ banks: buildBanks });
    }
}

studio.menu.addMenuItem({
    name: "Build banks for event",
    execute: execute,
    keySequence: "F8",
});