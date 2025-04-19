function pitchVolumeExecutor() {
    var event = studio.window.browserCurrent();

    if (!event || !event.isOfType("Event")) {
        return;
    }

    var parameterIndex = 0;
    var reverse = false;

    var closeButton = {
        widgetType: studio.ui.widgetType.PushButton,
        text: "Close",
        onClicked: function () {
            this.closeDialog();
        },
    };

    var addButton = {
        widgetType: studio.ui.widgetType.PushButton,
        text: "Add",
        onClicked: function () {
            var track = event.masterTrack;
            var editor = studio.window.editorCurrent();

            if (editor && editor.isOfType("Track")) {
                track = editor;
            }

            var effectChain = track.mixerGroup.effectChain;
            var gain = effectChain.addEffect("GainEffect");
            effectChain.relationships.effects.remove(gain);
            effectChain.relationships.effects.insert(0, gain);

            var auto = gain.addAutomator("gain");
            var param = event.parameters[parameterIndex].preset;

            var autoCurve = auto.addAutomationCurve(param);
            autoCurve.addAutomationPoint(param.minimum, reverse ? 0 : -Infinity);
            autoCurve.addAutomationPoint(param.maximum, reverse ? -Infinity : 0);

            this.closeDialog();
        },
    };

    var buttons;

    if (event.parameters.length == 0) {
        main = [{
            widgetType: studio.ui.widgetType.Label,
            text: "This event has no parameters",
        }];
        buttons = [closeButton];
    } else {
        main = [{
            widgetType: studio.ui.widgetType.ComboBox,
            items: event.parameters.map(function (p) {
                return {
                    text: p.preset.presetOwner.name,
                    userData: p.preset.id,
                };
            }),
            onCurrentIndexChanged: function () {
                parameterIndex = this.currentIndex();
            },
        }, {
            widgetType: studio.ui.widgetType.CheckBox,
            text: "Reverse",
            onToggled: function() {
                reverse = this.isChecked();
            },
        }];
        buttons = [addButton];
    }

    studio.ui.showModalDialog({
        widgetType: studio.ui.widgetType.Layout,
        layout: studio.ui.layoutType.VBoxLayout,
        items: main.concat([
            {
                widgetType: studio.ui.widgetType.Layout,
                layout: studio.ui.layoutType.HBoxLayout,
                items: buttons,
            },
        ]),
        minimumHeight: 100,
        minimumWidth: 100,
    });
}

studio.menu.addMenuItem({
    name: "Modulate gain from parameter...",
    execute: pitchVolumeExecutor,
    keySequence: "F9",
});
