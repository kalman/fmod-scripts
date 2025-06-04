
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

function findAutomationPoints(findAll) {
    var points = [];

    function findInArray(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].isOfType("AutomationPoint")) {
                if (findAll) {
                    points = points.concat(arr[i].automationCurve.automationPoints);
                } else {
                    points.push(arr[i]);
                }
            }
        }
    }

    findInArray(studio.window.editorSelection());
    findInArray(studio.window.deckSelection());
    return points;
}

function setCurveShapes() {
    if (findAutomationPoints(false).length == 0) {
        return;
    }

    var curveShapeInput;

    function createApplyWidget() {
        function createApplyButton(applyAll) {
            return {
                widgetType: studio.ui.widgetType.PushButton,
                text: "Apply" +  (applyAll ? " All" : ""),
                onClicked: function () {
                    var curveShapeString = curveShapeInput.text();
                    var curveShape = Number(curveShapeString);

                    if (isNaN(curveShape)) {
                        console.warn("Not a number: " + curveShapeString);
                        this.closeDialog();
                        return;
                    }

                    global.automationCurveShape = curveShape;

                    var automationPoints = findAutomationPoints(applyAll);

                    for (var i = 0; i < automationPoints.length; i++) {
                        automationPoints[i].properties.curveShape.setValue(curveShape);
                    }

                    this.closeDialog();
                },
            };
        }
        return {
            widgetType: studio.ui.widgetType.Layout,
            layout: studio.ui.layoutType.HBoxLayout,
            items: [createApplyButton(true), createApplyButton(false)],
        };
    }

    function createCurveShapeInput() {
        return {
            widgetType: studio.ui.widgetType.LineEdit,
            text: global.automationCurveShape || "0",
            onConstructed: function() {
                curveShapeInput = this;
            },
        };
    }

    function createItems() {
        return createArray([
            createCurveShapeInput(),
            createApplyWidget(),
        ]);
    }

    studio.ui.showModalDialog({
        widgetType: studio.ui.widgetType.Layout,
        layout: studio.ui.layoutType.VBoxLayout,
        items: createItems(),
        minimumWidth: 150,
        onConstructed: function() {
            dialog = this;
        },
    });
}

studio.menu.addMenuItem({
    name: "Automation\\Set Curve Shapes...",
    keySequence: "Alt+A",
    execute: setCurveShapes,
});
