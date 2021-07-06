import { dispatch as d3_dispatch } from 'd3-dispatch';

import { behaviorDraw } from './draw';
import { utilRebind } from '../util/rebind';


export function behaviorAddWay(context) {
    var dispatch = d3_dispatch('start', 'startFromWay', 'startFromNode', 'cancel', 'finish');
    var draw = behaviorDraw(context);

    function behavior(surface) {
        draw.on('click', function() { dispatch.apply('start', this, arguments); })
            .on('clickWay', function() { dispatch.apply('startFromWay', this, arguments); })
            .on('clickNode', function() { dispatch.apply('startFromNode', this, arguments); })
            .on('cancel', function() { dispatch.apply('cancel', this, arguments); })
            .on('finish', function() { dispatch.apply('finish', this, arguments); });

        context.map()
            .dblclickZoomEnable(false);

        surface.call(draw);
    }


    behavior.off = function(surface) {
        window.setTimeout(function() {
            context.map().dblclickZoomEnable(true);
        }, 1000);

        surface.call(draw.off);
<<<<<<< HEAD
=======
    };


    behavior.tail = function(text) {
        draw.tail(text);
        return behavior;
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };


    return utilRebind(behavior, dispatch, 'on');
}
