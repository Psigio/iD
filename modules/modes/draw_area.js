import { t } from '../core/localizer';
import { behaviorDrawWay } from '../behavior/draw_way';
import { modeSelect } from './select';
import { utilDisplayLabel } from '../util';

<<<<<<< HEAD

export function modeDrawArea(context, wayID, startGraph, button) {
=======
export function modeDrawArea(context, wayID, startGraph, baselineGraph, button, addMode) {
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    var mode = {
        button: button,
        id: 'draw-area',
        title: (addMode && addMode.title) || utilDisplayLabel(context.entity(wayID), context),
        geometry: 'area'
    };

<<<<<<< HEAD
    var behavior = behaviorDrawWay(context, wayID, mode, startGraph)
        .on('rejectedSelfIntersection.modeDrawArea', function() {
            context.ui().flash
                .iconName('#iD-icon-no')
                .label(t('self_intersection.error.areas'))();
        });
=======
    mode.addMode = addMode;
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

    mode.wayID = wayID;

    mode.preset = context.presets().match(context.entity(mode.wayID), context.graph());
<<<<<<< HEAD
=======

    var behavior;

    mode.enter = function() {
        var way = context.entity(wayID);

        behavior = behaviorDrawWay(context, wayID, undefined, mode, startGraph, baselineGraph)
            .tail(t('modes.draw_area.tail'));
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

    var behavior;

    mode.enter = function() {
        context.install(behavior);
    };

    mode.exit = function() {
        context.uninstall(behavior);
    };

<<<<<<< HEAD
=======
    mode.repeatAddedFeature = function(val) {
        if (addMode) return addMode.repeatAddedFeature(val);
    };

    mode.addedEntityIDs = function() {
        if (addMode) return addMode.addedEntityIDs();
    };

    mode.didFinishAdding = function() {
        if (mode.repeatAddedFeature()) {
            context.enter(addMode);
        }
        else {
            context.enter(modeSelect(context, mode.addedEntityIDs() || [wayID]).newFeature(true));
        }
    };


>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    mode.selectedIDs = function() {
        return [wayID];
    };

    mode.activeID = function() {
        return (behavior && behavior.activeID()) || [];
    };

<<<<<<< HEAD
=======

    mode.finish = function() {
        return behavior.finish();
    };


>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    return mode;
}
