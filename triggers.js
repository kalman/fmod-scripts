function getTriggerables() {
    return studio.window.editorSelection().filter(function (item) {
        return item && item.isOfType("Triggerable");
    });
}

function getConditionID(condition) {
    var signature = null;

    if (condition.isOfExactType("ParameterCondition") && condition.parameter) {
        signature = ["parameter", condition.parameter.id, condition.minimum, condition.maximum, condition.isInverted];
    } else if (condition.isOfExactType("EventCondition")) {
        signature = ["event", condition.eventState, condition.isInverted];
    }

    return signature ? JSON.stringify(signature) : null;
}

function getConditionDict(item) {
    var conditions = {};

    item.triggerConditions.forEach(function (condition) {
        var conditionID = getConditionID(condition);

        if (!(conditionID in conditions)) {
            conditions[conditionID] = condition;
        }
    });

    return conditions;
}

function clearTriggers() {
    getTriggerables().forEach(function (item) {
        while (item.triggerConditions.length > 0) {
            studio.project.deleteObject(item.triggerConditions[0]);
        }
    });
}

function unioniseTriggers() {
    var selectedInstruments = getTriggerables();
    var allConditions = {};

    selectedInstruments.forEach(function (item) {
        Object.assign(allConditions, getConditionDict(item));
    });

    selectedInstruments.forEach(function (item) {
        var conditionDict = getConditionDict(item);

        for (var k in allConditions) {
            if (k in conditionDict) {
                continue;
            }

            var condition = allConditions[k];
            var conditionClone = null;

            console.log("trying to copy condition " + k);

            if (condition.isOfType("ParameterCondition")) {
                conditionClone = studio.project.create("ParameterCondition");
                conditionClone.parameter = condition.parameter;
                conditionClone.minimum = condition.minimum;
                conditionClone.maximum = condition.maximum;
            } else {
                conditionClone.eventState = condition.eventState;
            }

            conditionClone.isInverted = condition.isInverted;
            item.relationships.triggerConditions.add(conditionClone);
        }
    });

    // var instruments = [];

    // // Filter the selection to only include Triggerable objects
    // selectedItems.forEach(function (item) {
    //     if (item.isOfType("Triggerable")) {
    //         instruments.push(item);
    //     }
    // });

    // if (instruments.length === 0) {
    //     return;
    // }

    // var uniqueSignatures = {};
    // var uniqueConditions = [];

    // // Step 1: Collect a distinct set of all conditions across selected instruments
    // instruments.forEach(function (inst) {
    //     var conditions = inst.triggerConditions;
    //     for (var j = 0; j < conditions.length; j++) {
    //         var cond = conditions[j];
    //         var sig = conditionID(cond);

    //         if (!uniqueSignatures[sig]) {
    //             uniqueSignatures[sig] = true;
    //             uniqueConditions.push(cond);
    //         }
    //     }
    // });

    // // Step 2: Apply missing conditions from the distinct set to every instrument
    // instruments.forEach(function (inst) {
    //     var currentSignatures = {};
    //     var conditions = inst.triggerConditions;

    //     // Track what signatures this instrument already has
    //     for (var j = 0; j < conditions.length; j++) {
    //         currentSignatures[conditionID(conditions[j])] = true;
    //     }

    //     // Create and append the missing conditions
    //     uniqueConditions.forEach(function (uCond) {
    //         var sig = conditionID(uCond);

    //         if (!currentSignatures[sig]) {
    //             var newCond = null;

    //             if (uCond.isOfExactType("ParameterCondition")) {
    //                 newCond = studio.project.create("ParameterCondition");
    //                 newCond.parameter = uCond.parameter;
    //                 newCond.minimum = uCond.minimum;
    //                 newCond.maximum = uCond.maximum;
    //                 newCond.isInverted = uCond.isInverted;
    //             } else if (uCond.isOfExactType("EventCondition")) {
    //                 newCond = studio.project.create("EventCondition");
    //                 newCond.eventState = uCond.eventState;
    //                 newCond.isInverted = uCond.isInverted;
    //             }

    //             if (newCond) {
    //                 inst.triggerConditions.push(newCond);
    //             }
    //         }
    //     });
    // });
}

studio.menu.addMenuItem({
    name: "Triggers\\Clear",
    keySequence: "Ctrl+Alt+R",
    execute: clearTriggers
});

studio.menu.addMenuItem({
    name: "Triggers\\Unionise",
    keySequence: "Ctrl+Alt+T",
    execute: unioniseTriggers
});