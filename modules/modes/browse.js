import { t } from '../core/localizer';

import { behaviorHover } from '../behavior/hover';
import { behaviorLasso } from '../behavior/lasso';
import { behaviorPaste } from '../behavior/paste';
import { behaviorSelect } from '../behavior/select';

import { modeDragNode } from './drag_node';
import { modeDragNote } from './drag_note';

import { operationPaste } from '../operations/paste';

export function modeBrowse(context) {
    var mode = {
        button: 'browse',
        id: 'browse',
        title: t('modes.browse.title'),
        description: t('modes.browse.description')
    };
<<<<<<< HEAD
    var sidebar;

    var _selectBehavior;
    var _behaviors = [];


    mode.selectBehavior = function(val) {
        if (!arguments.length) return _selectBehavior;
        _selectBehavior = val;
        return mode;
    };
=======

    var behaviors = [
        behaviorPaste(context),
        behaviorHover(context),
        behaviorSelect(context),
        behaviorLasso(context),
        modeDragNode(context).behavior,
        modeDragNote(context).behavior
    ];
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444


    mode.enter = function() {
        if (!_behaviors.length) {
            if (!_selectBehavior) _selectBehavior = behaviorSelect(context);
            _behaviors = [
                behaviorPaste(context),
                behaviorHover(context).on('hover', context.ui().sidebar.hover),
                _selectBehavior,
                behaviorLasso(context),
                modeDragNode(context).behavior,
                modeDragNote(context).behavior
            ];
        }
        _behaviors.forEach(context.install);

        // Get focus on the body.
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
    };


    mode.exit = function() {
<<<<<<< HEAD
        context.ui().sidebar.hover.cancel();
        _behaviors.forEach(context.uninstall);

        if (sidebar) {
            context.ui().sidebar.hide();
        }
    };


    mode.sidebar = function(_) {
        if (!arguments.length) return sidebar;
        sidebar = _;
        return mode;
=======
        behaviors.forEach(context.uninstall);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };


    mode.operations = function() {
        return [operationPaste(context)];
    };


    return mode;
}
