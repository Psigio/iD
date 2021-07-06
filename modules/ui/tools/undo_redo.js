import _debounce from 'lodash-es/debounce';

import {
    select as d3_select
} from 'd3-selection';

import { t, localizer } from '../../core/localizer';
import { svgIcon } from '../../svg';
import { uiCmd } from '../cmd';
import { uiTooltip } from '../tooltip';


export function uiToolUndoRedo(context) {

    var tool = {
        id: 'undo_redo',
<<<<<<< HEAD
        label: t.html('toolbar.undo_redo')
=======
        label: t('toolbar.undo_redo'),
        iconName: textDirection === 'rtl' ? 'iD-icon-redo' : 'iD-icon-undo',
        userToggleable: false
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };

    var commands = [{
        id: 'undo',
        cmd: uiCmd('⌘Z'),
        action: function() {
            context.undo();
        },
        annotation: function() {
            return context.history().undoAnnotation();
        },
        icon: 'iD-icon-' + (localizer.textDirection() === 'rtl' ? 'redo' : 'undo')
    }, {
        id: 'redo',
        cmd: uiCmd('⌘⇧Z'),
        action: function() {
            context.redo();
        },
        annotation: function() {
            return context.history().redoAnnotation();
        },
        icon: 'iD-icon-' + (localizer.textDirection() === 'rtl' ? 'undo' : 'redo')
    }];


    function editable() {
<<<<<<< HEAD
        return context.mode() && context.mode().id !== 'save' && context.map().editableDataEnabled(true /* ignore min zoom */);
=======
        return context.mode().id !== 'save' && context.map().editableDataEnabled(true /* ignore min zoom */);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    }

    var tooltipBehavior = tooltip()
        .placement('bottom')
        .html(true)
        .title(function (d) {
            return uiTooltipHtml(d.annotation() ?
                t(d.id + '.tooltip', {action: d.annotation()}) :
                t(d.id + '.nothing'), d.cmd);
        })
        .scrollContainer(d3_select('#bar'));

    var buttons;

    tool.render = function(selection) {
<<<<<<< HEAD
        var tooltipBehavior = uiTooltip()
            .placement('bottom')
            .title(function (d) {
                return d.annotation() ?
                    t.html(d.id + '.tooltip', { action: d.annotation() }) :
                    t.html(d.id + '.nothing');
            })
            .keys(function(d) {
                return [d.cmd];
            })
            .scrollContainer(context.container().select('.top-toolbar'));

        var lastPointerUpType;
=======
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

        buttons = selection.selectAll('button')
            .data(commands);

        var buttonsEnter = buttons
            .enter()
            .append('button')
            .attr('class', function(d) { return 'disabled ' + d.id + '-button bar-button'; })
            .on('pointerup', function(d3_event) {
                // `pointerup` is always called before `click`
                lastPointerUpType = d3_event.pointerType;
            })
            .on('click', function(d3_event, d) {
                d3_event.preventDefault();

                var annotation = d.annotation();

                if (editable() && annotation) {
                    d.action();
                }

                if (editable() && (
                    lastPointerUpType === 'touch' ||
                    lastPointerUpType === 'pen')
                ) {
                    // there are no tooltips for touch interactions so flash feedback instead

                    var text = annotation ?
                        t(d.id + '.tooltip', { action: annotation }) :
                        t(d.id + '.nothing');
                    context.ui().flash
                        .duration(2000)
                        .iconName('#' + d.icon)
                        .iconClass(annotation ? '' : 'disabled')
                        .label(text)();
                }
                lastPointerUpType = null;
            })
            .call(tooltipBehavior);

<<<<<<< HEAD
        buttons.each(function(d) {
=======
        buttonsEnter.each(function(d) {
            var iconName;
            if (textDirection === 'rtl') {
                // reverse the icons for right-to-left layout
                iconName = d.id === 'undo' ? 'redo' : 'undo';
            } else {
                iconName = d.id;
            }
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            d3_select(this)
                .call(svgIcon('#' + d.icon));
        });

        buttons = buttonsEnter.merge(buttons);
    };

    function update() {
        buttons
            .property('disabled', !editable())
            .classed('disabled', function(d) {
                return !editable() || !d.annotation();
            })
            .each(function() {
                var selection = d3_select(this);
                if (selection.property('tooltipVisible')) {
                    selection.call(tooltipBehavior.show);
                }
            });
    }

    tool.allowed = function() {
        return context.mode().id !== 'save';
    };
<<<<<<< HEAD

    tool.install = function() {
        context.keybinding()
            .on(commands[0].cmd, function(d3_event) {
                d3_event.preventDefault();
                if (editable()) commands[0].action();
            })
            .on(commands[1].cmd, function(d3_event) {
                d3_event.preventDefault();
                if (editable()) commands[1].action();
            });

=======

    tool.install = function() {
        context.keybinding()
            .on(commands[0].cmd, function() { d3_event.preventDefault(); commands[0].action(); })
            .on(commands[1].cmd, function() { d3_event.preventDefault(); commands[1].action(); });

>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
        var debouncedUpdate = _debounce(update, 500, { leading: true, trailing: true });

        context.map()
            .on('move.undo_redo', debouncedUpdate)
            .on('drawn.undo_redo', debouncedUpdate);

        context.history()
            .on('change.undo_redo', function(difference) {
                if (difference) update();
            });

        context
            .on('enter.undo_redo', update);
<<<<<<< HEAD


        function update() {
            buttons
                .classed('disabled', function(d) {
                    return !editable() || !d.annotation();
                })
                .each(function() {
                    var selection = d3_select(this);
                    if (!selection.select('.tooltip.in').empty()) {
                        selection.call(tooltipBehavior.updateContent);
                    }
                });
        }
=======
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };

    tool.uninstall = function() {
        context.keybinding()
            .off(commands[0].cmd)
            .off(commands[1].cmd);

        context.map()
            .on('move.undo_redo', null)
            .on('drawn.undo_redo', null);

        context.history()
            .on('change.undo_redo', null);

        context
            .on('enter.undo_redo', null);
    };

    return tool;
}
