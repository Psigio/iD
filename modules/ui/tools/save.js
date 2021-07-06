import { interpolateRgb as d3_interpolateRgb } from 'd3-interpolate';
<<<<<<< HEAD

import { t } from '../../core/localizer';
=======
import { event as d3_event, select as d3_select } from 'd3-selection';
import { t } from '../../util/locale';
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
import { modeSave } from '../../modes';
import { svgIcon } from '../../svg';
import { uiCmd } from '../cmd';
import { uiTooltip } from '../tooltip';


export function uiToolSave(context) {

    var tool = {
        id: 'save',
<<<<<<< HEAD
        label: t.html('save.title')
=======
        label: t('save.title'),
        userToggleable: false
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };

    var button = null;
    var tooltipBehavior = tooltip()
        .placement('bottom')
        .html(true)
        .title(uiTooltipHtml(t('save.no_changes'), key))
        .scrollContainer(d3_select('#bar'));
    var history = context.history();
    var key = uiCmd('⌘S');
    var _numChanges;

    function isSaving() {
        var mode = context.mode();
        return mode && mode.id === 'save';
    }

    function isDisabled() {
        return !_numChanges || isSaving();
    }

    function save(d3_event) {
        d3_event.preventDefault();
        if (!context.inIntro() && !isSaving() && history.hasChanges()) {
            context.enter(modeSave(context));
        }
    }

    function bgColor(count) {
        var step;
        if (count === 0) {
            return null;
        } else if (count <= 50) {
            step = count / 50;
            return d3_interpolateRgb('#fff', '#ff8')(step);  // white -> yellow
        } else {
            step = Math.min((count - 50) / 50, 1.0);
            return d3_interpolateRgb('#ff8', '#f88')(step);  // yellow -> red
        }
    }

    function updateCount() {
        var val = history.difference().summary().length;
        if (val === _numChanges) return;

        _numChanges = val;

        if (tooltipBehavior) {
            tooltipBehavior
<<<<<<< HEAD
                .title(t.html(_numChanges > 0 ? 'save.help' : 'save.no_changes'))
                .keys([key]);
=======
                .title(uiTooltipHtml(
                    t(val > 0 ? 'save.help' : 'save.no_changes'), key)
                );
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
        }

        if (button) {
            button
                .classed('disabled', isDisabled())
                .style('background', bgColor(val));

            button.select('span.count')
<<<<<<< HEAD
                .html(_numChanges);
=======
                .text(val);
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
        }
    }


    tool.render = function(selection) {
<<<<<<< HEAD
        tooltipBehavior = uiTooltip()
            .placement('bottom')
            .title(t.html('save.no_changes'))
            .keys([key])
            .scrollContainer(context.container().select('.top-toolbar'));

        var lastPointerUpType;
=======
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

        button = selection
            .selectAll('.bar-button')
            .data([0]);

        var buttonEnter = button
            .enter()
            .append('button')
            .attr('class', 'save disabled bar-button')
            .on('pointerup', function(d3_event) {
                lastPointerUpType = d3_event.pointerType;
            })
            .on('click', function(d3_event) {
                save(d3_event);

                if (_numChanges === 0 && (
                    lastPointerUpType === 'touch' ||
                    lastPointerUpType === 'pen')
                ) {
                    // there are no tooltips for touch interactions so flash feedback instead
                    context.ui().flash
                        .duration(2000)
                        .iconName('#iD-icon-save')
                        .iconClass('disabled')
                        .label(t.html('save.no_changes'))();
                }
                lastPointerUpType = null;
            })
            .call(tooltipBehavior);

        buttonEnter
            .call(svgIcon('#iD-icon-save'));

        buttonEnter
            .append('span')
            .attr('class', 'count')
            .attr('aria-hidden', 'true')
            .html('0');

        button = buttonEnter.merge(button);

        button = buttonEnter.merge(button);

        updateCount();
    };

    var disallowedModes = new Set([
        'save',
        'add-point',
        'add-line',
        'add-area',
        'draw-line',
        'draw-area'
    ]);

    tool.allowed = function() {
        return !disallowedModes.has(context.mode().id);
    };

    tool.install = function() {
        context.keybinding()
            .on(key, save, true);

        context.history()
            .on('change.save', updateCount);

        context
            .on('enter.save', function() {
                if (button) {
                    button
                        .classed('disabled', isDisabled());

                    if (isSaving()) {
                        button.call(tooltipBehavior.hide);
                    }
                }
            });
    };


    tool.uninstall = function() {

        _numChanges = null;

        context.keybinding()
            .off(key, true);

        context.history()
            .on('change.save', null);

        context
            .on('enter.save', null);

        button = null;
    };

    return tool;
}
