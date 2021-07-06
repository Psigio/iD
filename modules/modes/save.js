import { select as d3_select } from 'd3-selection';
import { t } from '../core/localizer';

import { modeBrowse } from './browse';
<<<<<<< HEAD
import { services } from '../services';
import { uiConflicts } from '../ui/conflicts';
import { uiConfirm } from '../ui/confirm';
import { uiCommit } from '../ui/commit';
import { uiSuccess } from '../ui/success';
import { utilKeybinding } from '../util';
=======
import { uiConflicts } from '../ui/conflicts';
import { uiConfirm } from '../ui/confirm';
import { uiLoading } from '../ui/loading';
import { utilArrayUnion, utilArrayUniq, utilDisplayName, utilDisplayType, utilKeybinding } from '../util';


var _isSaving = false;
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444


export function modeSave(context) {
    var mode = { id: 'save' };
    var keybinding = utilKeybinding('modeSave');

<<<<<<< HEAD
    var commit = uiCommit(context)
        .on('cancel', cancel);
    var _conflictsUi; // uiConflicts

    var _location;
    var _success;
=======
    var loading = uiLoading(context)
        .message(t('save.uploading'))
        .blocking(true);

    var _toCheck = [];
    var _toLoad = [];
    var _loaded = {};
    var _toLoadCount = 0;
    var _toLoadTotal = 0;

    var _conflicts = [];
    var _errors = [];
    var _origChanges;


    function cancel() {
        context.enter(modeBrowse(context));
    }


    mode.save = function(changeset, tryAgain, checkConflicts) {
        // Guard against accidentally entering save code twice - #4641
        if (_isSaving && !tryAgain) {
            return;
        }

        var osm = context.connection();
        if (!osm) {
            cancel();
            return;
        }

        // If user somehow got logged out mid-save, try to reauthenticate..
        // This can happen if they were logged in from before, but the tokens are no longer valid.
        if (!osm.authenticated()) {
            osm.authenticate(function(err) {
                if (err) {
                    cancel();   // quit save mode..
                } else {
                    mode.save(changeset, tryAgain, checkConflicts);  // continue where we left off..
                }
            });
            return;
        }
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

    var uploader = context.uploader()
        .on('saveStarted.modeSave', function() {
            keybindingOff();
<<<<<<< HEAD
        })
        // fire off some async work that we want to be ready later
        .on('willAttemptUpload.modeSave', prepareForSuccess)
        .on('progressChanged.modeSave', showProgress)
        .on('resultNoChanges.modeSave', function() {
            cancel();
        })
        .on('resultErrors.modeSave', showErrors)
        .on('resultConflicts.modeSave', showConflicts)
        .on('resultSuccess.modeSave', showSuccess);


    function cancel() {
        context.enter(modeBrowse(context));
=======
            context.container().call(loading);  // block input
            _isSaving = true;
        }

        var history = context.history();
        var localGraph = context.graph();
        var remoteGraph = coreGraph(history.base(), true);

        _conflicts = [];
        _errors = [];

        // Store original changes, in case user wants to download them as an .osc file
        _origChanges = history.changes(actionDiscardTags(history.difference()));

        // First time, `history.perform` a no-op action.
        // Any conflict resolutions will be done as `history.replace`
        if (!tryAgain) {
            history.perform(actionNoop());
        }

        // Attempt a fast upload.. If there are conflicts, re-enter with `checkConflicts = true`
        if (!checkConflicts) {
            upload(changeset);

        // Do the full (slow) conflict check..
        } else {
            var summary = history.difference().summary();
            _toCheck = [];
            for (var i = 0; i < summary.length; i++) {
                var item = summary[i];
                if (item.changeType === 'modified') {
                    _toCheck.push(item.entity.id);
                }
            }

            _toLoad = withChildNodes(_toCheck, localGraph);
            _loaded = {};
            _toLoadCount = 0;
            _toLoadTotal = _toLoad.length;

            if (_toCheck.length) {
                showProgress(_toLoadCount, _toLoadTotal);
                _toLoad.forEach(function(id) { _loaded[id] = false; });
                osm.loadMultiple(_toLoad, loaded);
            } else {
                upload(changeset);
            }
        }

        return;


        function withChildNodes(ids, graph) {
            var s = new Set(ids);
            ids.forEach(function(id) {
                var entity = graph.entity(id);
                if (entity.type !== 'way') return;

                graph.childNodes(entity).forEach(function(child) {
                    if (child.version !== undefined) {
                        s.add(child.id);
                    }
                });
            });

            return Array.from(s);
        }


        // Reload modified entities into an alternate graph and check for conflicts..
        function loaded(err, result) {
            if (_errors.length) return;

            if (err) {
                _errors.push({
                    msg: err.message || err.responseText,
                    details: [ t('save.status_code', { code: err.status }) ]
                });
                showErrors();

            } else {
                var loadMore = [];

                result.data.forEach(function(entity) {
                    remoteGraph.replace(entity);
                    _loaded[entity.id] = true;
                    _toLoad = _toLoad.filter(function(val) { return val !== entity.id; });

                    if (!entity.visible) return;

                    // Because loadMultiple doesn't download /full like loadEntity,
                    // need to also load children that aren't already being checked..
                    var i, id;
                    if (entity.type === 'way') {
                        for (i = 0; i < entity.nodes.length; i++) {
                            id = entity.nodes[i];
                            if (_loaded[id] === undefined) {
                                _loaded[id] = false;
                                loadMore.push(id);
                            }
                        }
                    } else if (entity.type === 'relation' && entity.isMultipolygon()) {
                        for (i = 0; i < entity.members.length; i++) {
                            id = entity.members[i].id;
                            if (_loaded[id] === undefined) {
                                _loaded[id] = false;
                                loadMore.push(id);
                            }
                        }
                    }
                });

                _toLoadCount += result.data.length;
                _toLoadTotal += loadMore.length;
                showProgress(_toLoadCount, _toLoadTotal);

                if (loadMore.length) {
                    _toLoad.push.apply(_toLoad, loadMore);
                    osm.loadMultiple(loadMore, loaded);
                }

                if (!_toLoad.length) {
                    detectConflicts();
                }
            }
        }


        function detectConflicts() {
            function choice(id, text, action) {
                return { id: id, text: text, action: function() { history.replace(action); } };
            }
            function formatUser(d) {
                return '<a href="' + osm.userURL(d) + '" target="_blank">' + d + '</a>';
            }
            function entityName(entity) {
                return utilDisplayName(entity) || (utilDisplayType(entity.id) + ' ' + entity.id);
            }

            function sameVersions(local, remote) {
                if (local.version !== remote.version) return false;

                if (local.type === 'way') {
                    var children = utilArrayUnion(local.nodes, remote.nodes);
                    for (var i = 0; i < children.length; i++) {
                        var a = localGraph.hasEntity(children[i]);
                        var b = remoteGraph.hasEntity(children[i]);
                        if (a && b && a.version !== b.version) return false;
                    }
                }

                return true;
            }

            _toCheck.forEach(function(id) {
                var local = localGraph.entity(id);
                var remote = remoteGraph.entity(id);

                if (sameVersions(local, remote)) return;

                var action = actionMergeRemoteChanges;
                var merge = action(id, localGraph, remoteGraph, formatUser);

                history.replace(merge);

                var mergeConflicts = merge.conflicts();
                if (!mergeConflicts.length) return;  // merged safely

                var forceLocal = action(id, localGraph, remoteGraph).withOption('force_local');
                var forceRemote = action(id, localGraph, remoteGraph).withOption('force_remote');
                var keepMine = t('save.conflict.' + (remote.visible ? 'keep_local' : 'restore'));
                var keepTheirs = t('save.conflict.' + (remote.visible ? 'keep_remote' : 'delete'));

                _conflicts.push({
                    id: id,
                    name: entityName(local),
                    details: mergeConflicts,
                    chosen: 1,
                    choices: [
                        choice(id, keepMine, forceLocal),
                        choice(id, keepTheirs, forceRemote)
                    ]
                });
            });

            upload(changeset);
        }
    };


    function upload(changeset) {
        var osm = context.connection();
        if (!osm) {
            _errors.push({ msg: 'No OSM Service' });
        }

        if (_conflicts.length) {
            _conflicts.sort(function(a, b) { return b.id.localeCompare(a.id); });
            showConflicts(changeset);

        } else if (_errors.length) {
            showErrors();

        } else {
            var history = context.history();
            var changes = history.changes(actionDiscardTags(history.difference()));
            if (changes.modified.length || changes.created.length || changes.deleted.length) {
                osm.putChangeset(changeset, changes, uploadCallback);
            } else {        // changes were insignificant or reverted by user
                d3_select('.inspector-wrap *').remove();
                loading.close();
                _isSaving = false;
                context.flush();
                cancel();
            }
        }
    }


    function uploadCallback(err, changeset) {
        if (err) {
            if (err.status === 409) {          // 409 Conflict
                mode.save(changeset, true, true);   // tryAgain = true, checkConflicts = true
            } else {
                _errors.push({
                    msg: err.message || err.responseText,
                    details: [ t('save.status_code', { code: err.status }) ]
                });
                showErrors();
            }

        } else {
            var changeCount = context.history().difference().summary().length;
            context.history().clearSaved();

            context.enter(modeBrowse(context));
            context.ui().assistant.didSaveChangset(changeset, changeCount);

            // Add delay to allow for postgres replication #1646 #2678
            window.setTimeout(function() {
                d3_select('.inspector-wrap *').remove();
                loading.close();
                _isSaving = false;
                context.flush();
            }, 2500);
        }
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    }


    function showProgress(num, total) {
        var modal = context.container().select('.loading-modal .modal-section');
        var progress = modal.selectAll('.progress')
            .data([0]);

        // enter/update
        progress.enter()
            .append('div')
            .attr('class', 'progress')
            .merge(progress)
            .text(t('save.conflict_progress', { num: num, total: total }));
    }


    function showConflicts(changeset, conflicts, origChanges) {

        var selection = context.container()
<<<<<<< HEAD
            .select('.sidebar')
=======
            .select('.assistant .assistant-body')
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            .append('div')
            .attr('class','inspector-body');

        context.container().selectAll('.main-content')
            .classed('active', true)
            .classed('inactive', false);

        _conflictsUi = uiConflicts(context)
            .conflictList(conflicts)
            .origChanges(origChanges)
            .on('cancel', function() {
                context.container().selectAll('.main-content')
                    .classed('active', false)
                    .classed('inactive', true);
                selection.remove();
                keybindingOn();

                uploader.cancelConflictResolution();
            })
            .on('save', function() {
                context.container().selectAll('.main-content')
                    .classed('active', false)
                    .classed('inactive', true);
                selection.remove();
<<<<<<< HEAD

                uploader.processResolvedConflicts(changeset);
=======
                mode.save(changeset, true, false);  // tryAgain = true, checkConflicts = false
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            });

        selection.call(_conflictsUi);
    }


    function showErrors(errors) {
        keybindingOn();

        var selection = uiConfirm(context.container());
        selection
            .select('.modal-section.header')
            .append('h3')
            .text(t('save.error'));

        addErrors(selection, errors);
        selection.okButton();
    }


    function addErrors(selection, data) {
        var message = selection
            .select('.modal-section.message-text');

        var items = message
            .selectAll('.error-container')
            .data(data);

        var enter = items.enter()
            .append('div')
            .attr('class', 'error-container');

        enter
            .append('a')
            .attr('class', 'error-description')
            .attr('href', '#')
            .classed('hide-toggle', true)
            .text(function(d) { return d.msg || t('save.unknown_error_details'); })
            .on('click', function(d3_event) {
                d3_event.preventDefault();

                var error = d3_select(this);
                var detail = d3_select(this.nextElementSibling);
                var exp = error.classed('expanded');

                detail.style('display', exp ? 'none' : 'block');
                error.classed('expanded', !exp);
            });

        var details = enter
            .append('div')
            .attr('class', 'error-detail-container')
            .style('display', 'none');

        details
            .append('ul')
            .attr('class', 'error-detail-list')
            .selectAll('li')
            .data(function(d) { return d.details || []; })
            .enter()
            .append('li')
            .attr('class', 'error-detail-item')
            .text(function(d) { return d; });

        items.exit()
            .remove();
    }


<<<<<<< HEAD
    function showSuccess(changeset) {
        commit.reset();

        var ui = _success
            .changeset(changeset)
            .location(_location)
            .on('cancel', function() { context.ui().sidebar.hide(); });

        context.enter(modeBrowse(context).sidebar(ui));
    }


=======
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    function keybindingOn() {
        d3_select(document)
            .call(keybinding.on('⎋', cancel, true));
    }


    function keybindingOff() {
        d3_select(document)
            .call(keybinding.unbind);
    }


<<<<<<< HEAD
    // Reverse geocode current map location so we can display a message on
    // the success screen like "Thank you for editing around place, region."
    function prepareForSuccess() {
        _success = uiSuccess(context);
        _location = null;
        if (!services.geocoder) return;

        services.geocoder.reverse(context.map().center(), function(err, result) {
            if (err || !result || !result.address) return;

            var addr = result.address;
            var place = (addr && (addr.town || addr.city || addr.county)) || '';
            var region = (addr && (addr.state || addr.country)) || '';
            var separator = (place && region) ? t('success.thank_you_where.separator') : '';

            _location = t('success.thank_you_where.format',
                { place: place, separator: separator, region: region }
            );
        });
    }


    mode.selectedIDs = function() {
        return _conflictsUi ? _conflictsUi.shownEntityIds() : [];
    };


=======
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    mode.enter = function() {

        // make sure the save UI is initially visible
        context.storage('assistant.collapsed.save', null);

        keybindingOn();

        context.container().selectAll('.main-content')
            .classed('active', false)
            .classed('inactive', true);

        var osm = context.connection();
        if (!osm) {
            cancel();
            return;
        }

        if (!osm.authenticated()) {
            osm.authenticate(function(err) {
                if (err) {
                    cancel();
                } else {
                    // reload
                    context.enter(mode);
                }
            });
        }
    };


    mode.exit = function() {

        keybindingOff();

<<<<<<< HEAD
        context.container().selectAll('.main-content')
            .classed('active', true)
            .classed('inactive', false);

        context.ui().sidebar.hide();
=======
        context.container().selectAll('#content')
            .attr('class', 'active');
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
    };

    return mode;
}
