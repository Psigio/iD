import { select as d3_select } from 'd3-selection';

import { t } from '../core/localizer';
import { services } from '../services';
import { modeBrowse } from '../modes/browse';
import { modeSelectError } from '../modes/select_error';

import { uiKeepRightDetails } from './keepRight_details';
<<<<<<< HEAD
import { uiKeepRightHeader } from './keepRight_header';
import { uiViewOnKeepRight } from './view_on_keepRight';

import { utilNoAuto } from '../util';

export function uiKeepRightEditor(context) {
  const dispatch = d3_dispatch('change');
  const qaDetails = uiKeepRightDetails(context);
  const qaHeader = uiKeepRightHeader(context);

  let _qaItem;

  function keepRightEditor(selection) {

    const headerEnter = selection.selectAll('.header')
      .data([0])
      .enter()
      .append('div')
        .attr('class', 'header fillL');

    headerEnter
      .append('button')
        .attr('class', 'close')
        .on('click', () => context.enter(modeBrowse(context)))
        .call(svgIcon('#iD-icon-close'));

    headerEnter
      .append('h3')
        .html(t.html('QA.keepRight.title'));


    let body = selection.selectAll('.body')
      .data([0]);

    body = body.enter()
      .append('div')
        .attr('class', 'body')
      .merge(body);

    const editor = body.selectAll('.qa-editor')
      .data([0]);

    editor.enter()
      .append('div')
        .attr('class', 'modal-section qa-editor')
      .merge(editor)
        .call(qaHeader.issue(_qaItem))
        .call(qaDetails.issue(_qaItem))
        .call(keepRightSaveSection);


    const footer = selection.selectAll('.footer')
      .data([0]);

    footer.enter()
      .append('div')
      .attr('class', 'footer')
      .merge(footer)
      .call(uiViewOnKeepRight(context).what(_qaItem));
  }


  function keepRightSaveSection(selection) {
    const isSelected = (_qaItem && _qaItem.id === context.selectedErrorID());
    const isShown = (_qaItem && (isSelected || _qaItem.newComment || _qaItem.comment));
    let saveSection = selection.selectAll('.qa-save')
      .data(
        (isShown ? [_qaItem] : []),
        d => `${d.id}-${d.status || 0}`
      );

    // exit
    saveSection.exit()
      .remove();

    // enter
    const saveSectionEnter = saveSection.enter()
      .append('div')
        .attr('class', 'qa-save save-section cf');

    saveSectionEnter
      .append('h4')
        .attr('class', '.qa-save-header')
        .html(t.html('QA.keepRight.comment'));

    saveSectionEnter
      .append('textarea')
        .attr('class', 'new-comment-input')
        .attr('placeholder', t('QA.keepRight.comment_placeholder'))
        .attr('maxlength', 1000)
        .property('value', d => d.newComment || d.comment)
        .call(utilNoAuto)
        .on('input', changeInput)
        .on('blur', changeInput);

    // update
    saveSection = saveSectionEnter
      .merge(saveSection)
        .call(qaSaveButtons);

    function changeInput() {
      const input = d3_select(this);
      let val = input.property('value').trim();

      if (val === _qaItem.comment) {
        val = undefined;
      }

      // store the unsaved comment with the issue itself
      _qaItem = _qaItem.update({ newComment: val });

      const qaService = services.keepRight;
      if (qaService) {
        qaService.replaceItem(_qaItem);  // update keepright cache
      }

      saveSection
        .call(qaSaveButtons);
    }
  }


  function qaSaveButtons(selection) {
    const isSelected = (_qaItem && _qaItem.id === context.selectedErrorID());
    let buttonSection = selection.selectAll('.buttons')
      .data((isSelected ? [_qaItem] : []), d => d.status + d.id);

    // exit
    buttonSection.exit()
      .remove();

    // enter
    const buttonEnter = buttonSection.enter()
      .append('div')
        .attr('class', 'buttons');

    buttonEnter
      .append('button')
        .attr('class', 'button comment-button action')
        .html(t.html('QA.keepRight.save_comment'));

    buttonEnter
      .append('button')
        .attr('class', 'button close-button action');

    buttonEnter
      .append('button')
        .attr('class', 'button ignore-button action');

    // update
    buttonSection = buttonSection
      .merge(buttonEnter);

    buttonSection.select('.comment-button')   // select and propagate data
      .attr('disabled', d => d.newComment ? null : true)
      .on('click.comment', function(d3_event, d) {
        this.blur();    // avoid keeping focus on the button - #4641
        const qaService = services.keepRight;
        if (qaService) {
          qaService.postUpdate(d, (err, item) => dispatch.call('change', item));
        }
      });

    buttonSection.select('.close-button')   // select and propagate data
      .html(d => {
        const andComment = (d.newComment ? '_comment' : '');
        return t.html(`QA.keepRight.close${andComment}`);
      })
      .on('click.close', function(d3_event, d) {
        this.blur();    // avoid keeping focus on the button - #4641
        const qaService = services.keepRight;
        if (qaService) {
          d.newStatus = 'ignore_t';   // ignore temporarily (item fixed)
          qaService.postUpdate(d, (err, item) => dispatch.call('change', item));
        }
      });

    buttonSection.select('.ignore-button')   // select and propagate data
      .html(d => {
        const andComment = (d.newComment ? '_comment' : '');
        return t.html(`QA.keepRight.ignore${andComment}`);
      })
      .on('click.ignore', function(d3_event, d) {
        this.blur();    // avoid keeping focus on the button - #4641
        const qaService = services.keepRight;
        if (qaService) {
          d.newStatus = 'ignore';   // ignore permanently (false positive)
          qaService.postUpdate(d, (err, item) => dispatch.call('change', item));
        }
      });
  }
=======
import { uiViewOnKeepRight } from './view_on_keepRight';

import { utilNoAuto } from '../util';


export function uiKeepRightEditor(context) {
    var keepRightDetails = uiKeepRightDetails(context);

    var _error;

    function keepRightEditor(selection) {

        var body = selection.selectAll('.inspector-body')
            .data([0]);

        body = body.enter()
            .append('div')
            .attr('class', 'inspector-body sep-top')
            .merge(body);

        var editor = body.selectAll('.error-editor')
            .data([0]);

        editor.enter()
            .append('div')
            .attr('class', 'modal-section error-editor')
            .merge(editor)
            .call(keepRightDetails.error(_error))
            .call(keepRightSaveSection);


        var footer = selection.selectAll('.inspector-footer')
            .data([0]);

        footer.enter()
            .append('div')
            .attr('class', 'inspector-footer')
            .merge(footer)
            .call(uiViewOnKeepRight(context).what(_error));
    }


    function keepRightSaveSection(selection) {
        var isSelected = (_error && context.mode().selectedErrorID && _error.id === context.mode().selectedErrorID());
        var isShown = (_error && (isSelected || _error.newComment || _error.comment));
        var saveSection = selection.selectAll('.error-save')
            .data(
                (isShown ? [_error] : []),
                function(d) { return d.id + '-' + (d.status || 0); }
            );

        // exit
        saveSection.exit()
            .remove();

        // enter
        var saveSectionEnter = saveSection.enter()
            .append('div')
            .attr('class', 'error-save save-section cf');

        saveSectionEnter
            .append('h4')
            .attr('class', '.error-save-header')
            .text(t('QA.keepRight.comment'));

        saveSectionEnter
            .append('textarea')
            .attr('class', 'new-comment-input')
            .attr('placeholder', t('QA.keepRight.comment_placeholder'))
            .attr('maxlength', 1000)
            .property('value', function(d) { return d.newComment || d.comment; })
            .call(utilNoAuto)
            .on('input', changeInput)
            .on('blur', changeInput);

        // update
        saveSection = saveSectionEnter
            .merge(saveSection)
            .call(keepRightSaveButtons);


        function changeInput() {
            var input = d3_select(this);
            var val = input.property('value').trim();

            if (val === _error.comment) {
                val = undefined;
            }

            // store the unsaved comment with the error itself
            _error = _error.update({ newComment: val });

            var keepRight = services.keepRight;
            if (keepRight) {
                keepRight.replaceError(_error);  // update keepright cache
            }

            saveSection
                .call(keepRightSaveButtons);
        }
    }


    function keepRightSaveButtons(selection) {
        var isSelected = (_error && context.mode().selectedErrorID && _error.id === context.mode().selectedErrorID());
        var buttonSection = selection.selectAll('.buttons')
            .data((isSelected ? [_error] : []), function(d) { return d.status + d.id; });

        // exit
        buttonSection.exit()
            .remove();

        // enter
        var buttonEnter = buttonSection.enter()
            .append('div')
            .attr('class', 'buttons');

        buttonEnter
            .append('button')
            .attr('class', 'button comment-button action')
            .text(t('QA.keepRight.save_comment'));

        buttonEnter
            .append('button')
            .attr('class', 'button close-button action');

        buttonEnter
            .append('button')
            .attr('class', 'button ignore-button action');


        // update
        buttonSection = buttonSection
            .merge(buttonEnter);

        buttonSection.select('.comment-button')   // select and propagate data
            .attr('disabled', function(d) {
                return d.newComment === undefined ? true : null;
            })
            .on('click.comment', function(d) {
                this.blur();    // avoid keeping focus on the button - #4641
                var keepRight = services.keepRight;
                if (keepRight) {
                    keepRight.postKeepRightUpdate(d, remoteUpdateCallback);
                }
            });

        buttonSection.select('.close-button')   // select and propagate data
            .text(function(d) {
                var andComment = (d.newComment !== undefined ? '_comment' : '');
                return t('QA.keepRight.close' + andComment);
            })
            .on('click.close', function(d) {
                this.blur();    // avoid keeping focus on the button - #4641
                var keepRight = services.keepRight;
                if (keepRight) {
                    d.state = 'ignore_t';   // ignore temporarily (error fixed)
                    keepRight.postKeepRightUpdate(d, remoteUpdateCallback);
                }
            });

        buttonSection.select('.ignore-button')   // select and propagate data
            .text(function(d) {
                var andComment = (d.newComment !== undefined ? '_comment' : '');
                return t('QA.keepRight.ignore' + andComment);
            })
            .on('click.ignore', function(d) {
                this.blur();    // avoid keeping focus on the button - #4641
                var keepRight = services.keepRight;
                if (keepRight) {
                    d.state = 'ignore';   // ignore permanently (false positive)
                    keepRight.postKeepRightUpdate(d, remoteUpdateCallback);
                }
            });
    }

    function remoteUpdateCallback(err, error) {
        context.map().pan([0,0]);  // trigger a redraw

        if (err || !error || !error.id) {
            context.enter(modeBrowse(context));
        } else {
            context.enter(modeSelectError(context, error.id, 'keepRight'));
        }
    }


    keepRightEditor.error = function(val) {
        if (!arguments.length) return _error;
        _error = val;
        return keepRightEditor;
    };
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

  // NOTE: Don't change method name until UI v3 is merged
  keepRightEditor.error = function(val) {
    if (!arguments.length) return _qaItem;
    _qaItem = val;
    return keepRightEditor;
  };

<<<<<<< HEAD
  return utilRebind(keepRightEditor, dispatch, 'on');
=======
    return keepRightEditor;
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
}
