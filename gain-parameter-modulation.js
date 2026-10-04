function findParameters(event, showAll) {
    var parameters;
    if (showAll) {
        parameters = studio.project.model.ParameterPreset.findInstances();
    } else {
        parameters = event.getParameterPresets().map(function (p) {
            return p.presetOwner;
        });
    }
    parameters.sort(function (a, b) {
        return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
    });
    return parameters;
}

function createComboItems(parameters) {
    return parameters.map(function (p) {
        return {
            text: p.name,
            userData: p.id,
        };
    });
}

function createArray(arrOpts) {
    var arr = [];
    for (var i = 0; i < arrOpts.length; i++) {
        if (arrOpts[i] instanceof Array) {
            if (arrOpts[i][0]) {
                arr.push(arrOpts[i][1]);
            }
        } else {
            arr.push(arrOpts[i]);
        }
    }
    return arr;
}

function pitchVolumeExecutor(sendToReturnTrack) {
    return function() {
        var event = studio.window.browserCurrent();

        if (!event || !event.isOfType("Event")) {
            return;
        }

        var showAllParameters = false;
        var parameters = findParameters(event, showAllParameters);
        var returnTracks = event.returnTracks.map(function(r) {
            return r.mixerReturn;
        });
        var reverse = false;
        var parameterComboBox;
        var returnsComboBox;
        var dialog;

        function createAddWidget() {
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

                    function automate(auto, direction) {
                        var param = parameters[parameterComboBox.currentIndex()].parameter;
                        var autoCurve = auto.addAutomationCurve(param);
                        if (reverse) {
                            direction = !direction;
                        }
                        autoCurve.addAutomationPoint(param.minimum, direction ? 0 : -Infinity);
                        autoCurve.addAutomationPoint(param.maximum, direction ? -Infinity : 0);
                    }

                    automate(gain.addAutomator("gain"), true);

                    if (sendToReturnTrack && returnTracks.length > 0) {
                        var send = effectChain.addEffect("MixerSend");
                        effectChain.relationships.effects.remove(send);
                        effectChain.relationships.effects.insert(0, send);
                        send.relationships.mixerReturn.add(returnTracks[returnsComboBox.currentIndex()]);
                        automate(send.addAutomator("level", false));
                    }

                    this.closeDialog();
                },
            };
            return {
                widgetType: studio.ui.widgetType.Layout,
                layout: studio.ui.layoutType.HBoxLayout,
                items: [addButton],
            };
        }

        function createParameterComboBoxWidget() {
            return {
                widgetType: studio.ui.widgetType.ComboBox,
                items: createComboItems(parameters),
                onConstructed: function() {
                    parameterComboBox = this;
                },
            };
        }

        function createShowAllCheckboxWidget() {
            return {
                widgetType: studio.ui.widgetType.CheckBox,
                text: "Show All",
                onToggled: function () {
                    showAllParameters = this.isChecked();
                    parameters = findParameters(event, showAllParameters);
                    parameterComboBox.setItems(createComboItems(parameters));
                },
            };
        }

        function createReverseCheckboxWidget() {
            return {
                widgetType: studio.ui.widgetType.CheckBox,
                text: "Fade In",
                onToggled: function () {
                    reverse = this.isChecked();
                },
            };
        }

        function createReturnTracksComboBoxWidget() {
            return {
                widgetType: studio.ui.widgetType.ComboBox,
                items: createComboItems(returnTracks),
                onConstructed: function() {
                    returnsComboBox = this;
                },
            };
        }

        function createItems() {
            return createArray([
                createParameterComboBoxWidget(),
                createShowAllCheckboxWidget(),
                [sendToReturnTrack, createReturnTracksComboBoxWidget()],
                createReverseCheckboxWidget(),
                createAddWidget(),
            ]);
        }

        studio.ui.showModalDialog({
            widgetType: studio.ui.widgetType.Layout,
            layout: studio.ui.layoutType.VBoxLayout,
            items: createItems(),
            minimumWidth: 300,
            onConstructed: function() {
                dialog = this;
            },
        });
    };
}

studio.menu.addMenuItem({
    name: "Create Effect\\Modulate Gain...",
    execute: pitchVolumeExecutor(false),
});

studio.menu.addMenuItem({
    name: "Create Effect\\Redirect to Send...",
    execute: pitchVolumeExecutor(true),
});
