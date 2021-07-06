import _debounce from 'lodash-es/debounce';

import { select as d3_select } from 'd3-selection';

import {
    modeAddNote,
    modeBrowse
} from '../../modes';

import { t } from '../../core/localizer';
import { svgIcon } from '../../svg';
import { uiTooltip } from '../tooltip';

export function uiToolNotes(context) {

    var tool = {
        id: 'notes',
<<<<<<< HEAD
        label: t.html('modes.add_note.label')
=======
        label: t('modes.add_note.label'),
        iconName: 'iD-icon-note'
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };

    var mode = modeAddNote(context);

    function enabled() {
        return notesEnabled() && notesEditable();
    }

    function notesEnabled() {
        var noteLayer = context.layers().layer('notes');
        return noteLayer && noteLayer.enabled();
    }

    function notesEditable() {
        var mode = context.mode();
        return context.map().notesEditable() && mode && mode.id !== 'save';
    }

    context.keybinding().on(mode.key, function() {
        if (!enabled(mode)) return;

        if (mode.id === context.mode().id) {
            context.enter(modeBrowse(context));
        } else {
            context.enter(mode);
        }
    });

    var selection;
    tool.render = function(sel) {
        selection = sel;
        update();
    };
<<<<<<< HEAD

    function update() {
        var showNotes = notesEnabled();
        var data = showNotes ? [mode] : [];

        var buttons = selection.selectAll('button.add-button')
            .data(data, function(d) { return d.id; });

        // exit
        buttons.exit()
            .remove();

        // enter
        var buttonsEnter = buttons.enter()
            .append('button')
            .attr('tabindex', -1)
            .attr('class', function(d) { return d.id + ' add-button bar-button'; })
            .on('click.notes', function(d) {
                if (!enabled(d)) return;

                // When drawing, ignore accidental clicks on mode buttons - #4042
                var currMode = context.mode().id;
                if (/^draw/.test(currMode)) return;

                if (d.id === currMode) {
                    context.enter(modeBrowse(context));
                } else {
                    context.enter(d);
                }
            })
            .call(tooltip()
                .placement('bottom')
                .html(true)
                .title(function(d) { return uiTooltipHtml(d.description, d.key); })
                .scrollContainer(d3_select('#bar'))
            );

        buttonsEnter
            .each(function() {
                d3_select(this)
                    .call(svgIcon('#' + tool.iconName));
            });

        // if we are adding/removing the buttons, check if toolbar has overflowed
        if (buttons.enter().size() || buttons.exit().size()) {
            context.ui().checkOverflow('#bar', true);
        }

        // update
        buttons = buttons
            .merge(buttonsEnter)
            .classed('disabled', function(d) { return !enabled(d); });
    }

    tool.allowed = function() {
        return notesEnabled();
    };

    tool.install = function() {

=======

    function update() {
        var showNotes = notesEnabled();
        var data = showNotes ? [mode] : [];

        var buttons = selection.selectAll('button.add-button')
            .data(data, function(d) { return d.id; });

        // exit
        buttons.exit()
            .remove();

        // enter
        var buttonsEnter = buttons.enter()
            .append('button')
            .attr('tabindex', -1)
            .attr('class', function(d) { return d.id + ' add-button bar-button'; })
            .on('click.notes', function(d) {
                if (!enabled(d)) return;

                // When drawing, ignore accidental clicks on mode buttons - #4042
                var currMode = context.mode().id;
                if (/^draw/.test(currMode)) return;

                if (d.id === currMode) {
                    context.enter(modeBrowse(context));
                } else {
                    context.enter(d);
                }
            })
            .call(tooltip()
                .placement('bottom')
                .html(true)
                .title(function(d) { return uiTooltipHtml(d.description, d.key); })
                .scrollContainer(d3_select('#bar'))
            );

        buttonsEnter
            .each(function() {
                d3_select(this)
                    .call(svgIcon('#' + tool.iconName));
            });

        // if we are adding/removing the buttons, check if toolbar has overflowed
        if (buttons.enter().size() || buttons.exit().size()) {
            context.ui().checkOverflow('#bar', true);
        }

        // update
        buttons = buttons
            .merge(buttonsEnter)
            .classed('disabled', function(d) { return !enabled(d); });
    }

    tool.allowed = function() {
        return notesEnabled();
    };

    tool.install = function() {

        context
            .on('enter.editor.notes', function(entered) {
                selection.selectAll('button.add-button')
                    .classed('active', function(mode) { return entered.button === mode.button; });
            });

>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
        var debouncedUpdate = _debounce(update, 500, { leading: true, trailing: true });

        context.map()
            .on('move.notes', debouncedUpdate)
            .on('drawn.notes', debouncedUpdate);

        context
            .on('enter.notes', update);
<<<<<<< HEAD

        update();


        function update() {
            var showNotes = notesEnabled();
            var data = showNotes ? [mode] : [];

            var buttons = selection.selectAll('button.add-button')
                .data(data, function(d) { return d.id; });

            // exit
            buttons.exit()
                .remove();

            // enter
            var buttonsEnter = buttons.enter()
                .append('button')
                .attr('class', function(d) { return d.id + ' add-button bar-button'; })
                .on('click.notes', function(d3_event, d) {
                    if (!enabled(d)) return;

                    // When drawing, ignore accidental clicks on mode buttons - #4042
                    var currMode = context.mode().id;
                    if (/^draw/.test(currMode)) return;

                    if (d.id === currMode) {
                        context.enter(modeBrowse(context));
                    } else {
                        context.enter(d);
                    }
                })
                .call(uiTooltip()
                    .placement('bottom')
                    .title(function(d) { return d.description; })
                    .keys(function(d) { return [d.key]; })
                    .scrollContainer(context.container().select('.top-toolbar'))
                );

            buttonsEnter
                .each(function(d) {
                    d3_select(this)
                        .call(svgIcon(d.icon || '#iD-icon-' + d.button));
                });

            // if we are adding/removing the buttons, check if toolbar has overflowed
            if (buttons.enter().size() || buttons.exit().size()) {
                context.ui().checkOverflow('.top-toolbar', true);
            }

            // update
            buttons = buttons
                .merge(buttonsEnter)
                .classed('disabled', function(d) { return !enabled(d); })
                .classed('active', function(d) { return context.mode() && context.mode().button === d.button; });
        }
=======
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };

    tool.uninstall = function() {
        context
            .on('enter.editor.notes', null)
            .on('exit.editor.notes', null)
            .on('enter.notes', null);

        context.map()
            .on('move.notes', null)
            .on('drawn.notes', null);
    };

    return tool;
}
