import { dispatch as d3_dispatch } from 'd3-dispatch';
import { select as d3_select } from 'd3-selection';

import { resolveStrings } from 'osm-community-index';

import { fileFetcher } from '../core/file_fetcher';
import { locationManager } from '../core/locations';
import { t, localizer } from '../core/localizer';

import { svgIcon } from '../svg/icon';
import { uiDisclosure } from '../ui/disclosure';
import { utilRebind } from '../util/rebind';


<<<<<<< HEAD
let _oci = null;
=======
export function uiSuccess(context) {
    var MAXEVENTS = 2;
    var detected = utilDetect();
    var dispatch = d3_dispatch('cancel');
    var _changeset;
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444

export function uiSuccess(context) {
  const MAXEVENTS = 2;
  const dispatch = d3_dispatch('cancel');
  let _changeset;
  let _location;
  ensureOSMCommunityIndex();   // start fetching the data


  function ensureOSMCommunityIndex() {
    const data = fileFetcher;
    return Promise.all([
        data.get('oci_features'),
        data.get('oci_resources'),
        data.get('oci_defaults')
      ])
      .then(vals => {
        if (_oci) return _oci;

        // Merge Custom Features
        if (vals[0] && Array.isArray(vals[0].features)) {
          locationManager.mergeCustomGeoJSON(vals[0]);
        }

<<<<<<< HEAD
        let ociResources = Object.values(vals[1].resources);
        if (ociResources.length) {
          // Resolve all locationSet features.
          return locationManager.mergeLocationSets(ociResources)
            .then(() => {
              _oci = {
                resources: ociResources,
                defaults: vals[2].defaults
              };
              return _oci;
=======
        var parsed = new Date(raw);
        return new Date(parsed.toUTCString().substr(0, 25));  // convert to local timezone
    }


    function success(selection) {

        var body = selection
            .append('div')
            .attr('class', 'save-success sep-top');

        var summary = body
            .append('div')
            .attr('class', 'save-summary assistant-row');

        var osm = context.connection();
        if (!osm) return;

        var changesetURL = osm.changesetURL(_changeset.id);

        summary
            .append('div')
            .attr('class', 'icon-col summary-icon')
            .append('a')
            .attr('target', '_blank')
            .attr('href', changesetURL)
            .append('svg')
            .attr('class', 'logo-small')
            .append('use')
            .attr('xlink:href', '#iD-logo-osm');

        var summaryDetail = summary
            .append('div')
            .attr('class', 'main-col cell-detail summary-detail');

        summaryDetail
            .append('a')
            .attr('class', 'cell-detail summary-view-on-osm')
            .attr('target', '_blank')
            .attr('href', changesetURL)
            .text(t('success.view_on_osm'));

        summaryDetail
            .append('div')
            .html(t('success.changeset_id', {
                changeset_id: '<a href="' + changesetURL + '" target="_blank">' + _changeset.id + '</a>'
            }));


        // Gather community polygon IDs intersecting the map..
        var matchFeatures = data.community.query(context.map().center(), true) || [];
        var matchIDs = matchFeatures.map(function(feature) { return feature.id; });

        // Gather community resources that are either global or match a polygon.
        var matchResources = Object.values(data.community.resources)
            .filter(function(v) { return !v.featureId || matchIDs.indexOf(v.featureId) !== -1; });

        if (matchResources.length) {
            // sort by size ascending, then by community rank
            matchResources.sort(function(a, b) {
                var aSize = Infinity;
                var bSize = Infinity;
                var aOrder = a.order || 0;
                var bOrder = b.order || 0;

                if (a.featureId) {
                    aSize = data.community.features[a.featureId].properties.area;
                }
                if (b.featureId) {
                    bSize = data.community.features[b.featureId].properties.area;
                }

                return aSize < bSize ? -1 : aSize > bSize ? 1 : bOrder - aOrder;
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
            });
        } else {
          _oci = {
            resources: [],  // no resources?
            defaults: vals[2].defaults
          };
          return _oci;
        }
<<<<<<< HEAD
      });
  }
=======
    }


    function showCommunityLinks(selection, matchResources) {
        var communityLinks = selection
            .append('div')
            .attr('class', 'save-communityLinks sep-top');

        communityLinks
            .append('h3')
            .text(t('success.like_osm'));

        var table = communityLinks
            .append('div')
            .attr('class', 'community-table');

        var row = table.selectAll('.community-row')
            .data(matchResources);

        var rowEnter = row.enter()
            .append('div')
            .attr('class', 'assistant-row community-row');

        rowEnter
            .append('div')
            .attr('class', 'icon-col cell-icon community-icon')
            .append('a')
            .attr('target', '_blank')
            .attr('href', function(d) { return d.url; })
            .append('svg')
            .attr('class', 'logo-small')
            .append('use')
            .attr('xlink:href', function(d) { return '#community-' + d.type; });

        var communityDetail = rowEnter
            .append('div')
            .attr('class', 'main-col cell-detail community-detail');

        communityDetail
            .each(showCommunityDetails);

        communityLinks
            .append('div')
            .attr('class', 'community-missing')
            .text(t('success.missing'))
            .append('a')
            .attr('class', 'link-out')
            .attr('target', '_blank')
            .attr('tabindex', -1)
            .call(svgIcon('#iD-icon-out-link', 'inline'))
            .attr('href', 'https://github.com/osmlab/osm-community-index/issues')
            .append('span')
            .text(t('success.tell_us'));
    }

>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444


  // string-to-date parsing in JavaScript is weird
  function parseEventDate(when) {
    if (!when) return;

    let raw = when.trim();
    if (!raw) return;

    if (!/Z$/.test(raw)) {   // if no trailing 'Z', add one
      raw += 'Z';            // this forces date to be parsed as a UTC date
    }

    const parsed = new Date(raw);
    return new Date(parsed.toUTCString().substr(0, 25));  // convert to local timezone
  }


  function success(selection) {
    let header = selection
      .append('div')
      .attr('class', 'header fillL');

    header
      .append('h3')
      .html(t.html('success.just_edited'));

    header
      .append('button')
      .attr('class', 'close')
      .on('click', () => dispatch.call('cancel'))
      .call(svgIcon('#iD-icon-close'));

    let body = selection
      .append('div')
      .attr('class', 'body save-success fillL');

    let summary = body
      .append('div')
      .attr('class', 'save-summary');

    summary
      .append('h3')
      .html(t.html('success.thank_you' + (_location ? '_location' : ''), { where: _location }));

    summary
      .append('p')
      .html(t.html('success.help_html'))
      .append('a')
      .attr('class', 'link-out')
      .attr('target', '_blank')
      .attr('href', t('success.help_link_url'))
      .call(svgIcon('#iD-icon-out-link', 'inline'))
      .append('span')
      .html(t.html('success.help_link_text'));

    let osm = context.connection();
    if (!osm) return;

    let changesetURL = osm.changesetURL(_changeset.id);

    let table = summary
      .append('table')
      .attr('class', 'summary-table');

    let row = table
      .append('tr')
      .attr('class', 'summary-row');

    row
      .append('td')
      .attr('class', 'cell-icon summary-icon')
      .append('a')
      .attr('target', '_blank')
      .attr('href', changesetURL)
      .append('svg')
      .attr('class', 'logo-small')
      .append('use')
      .attr('xlink:href', '#iD-logo-osm');

    let summaryDetail = row
      .append('td')
      .attr('class', 'cell-detail summary-detail');

    summaryDetail
      .append('a')
      .attr('class', 'cell-detail summary-view-on-osm')
      .attr('target', '_blank')
      .attr('href', changesetURL)
      .html(t.html('success.view_on_osm'));

    summaryDetail
      .append('div')
      .html(t.html('success.changeset_id', {
        changeset_id: `<a href="${changesetURL}" target="_blank">${_changeset.id}</a>`
      }));


    // Get OSM community index features intersecting the map..
    ensureOSMCommunityIndex()
      .then(oci => {
        const loc = context.map().center();
        const validLocations = locationManager.locationsAt(loc);

        // Gather the communities
        let communities = [];
        oci.resources.forEach(resource => {
          let area = validLocations[resource.locationSetID];
          if (!area) return;

          // Resolve strings
          const localizer = (stringID) => t.html(`community.${stringID}`);
          resource.resolved = resolveStrings(resource, oci.defaults, localizer);
          
          communities.push({
            area: area,
            order: resource.order || 0,
            resource: resource
          });
        });

        // sort communities by feature area ascending, community order descending
        communities.sort((a, b) => a.area - b.area || b.order - a.order);

        body
          .call(showCommunityLinks, communities.map(c => c.resource));
      });
  }


  function showCommunityLinks(selection, resources) {
    let communityLinks = selection
      .append('div')
      .attr('class', 'save-communityLinks');

    communityLinks
      .append('h3')
      .html(t.html('success.like_osm'));

    let table = communityLinks
      .append('table')
      .attr('class', 'community-table');

    let row = table.selectAll('.community-row')
      .data(resources);

    let rowEnter = row.enter()
      .append('tr')
      .attr('class', 'community-row');

    rowEnter
      .append('td')
      .attr('class', 'cell-icon community-icon')
      .append('a')
      .attr('target', '_blank')
      .attr('href', d => d.resolved.url)
      .append('svg')
      .attr('class', 'logo-small')
      .append('use')
      .attr('xlink:href', d => `#community-${d.type}`);

    let communityDetail = rowEnter
      .append('td')
      .attr('class', 'cell-detail community-detail');

    communityDetail
      .each(showCommunityDetails);

    communityLinks
      .append('div')
      .attr('class', 'community-missing')
      .html(t.html('success.missing'))
      .append('a')
      .attr('class', 'link-out')
      .attr('target', '_blank')
      .call(svgIcon('#iD-icon-out-link', 'inline'))
      .attr('href', 'https://github.com/osmlab/osm-community-index/issues')
      .append('span')
      .html(t.html('success.tell_us'));
  }


  function showCommunityDetails(d) {
    let selection = d3_select(this);
    let communityID = d.id;

    selection
      .append('div')
      .attr('class', 'community-name')
      .html(d.resolved.nameHTML);

    selection
      .append('div')
      .attr('class', 'community-description')
      .html(d.resolved.descriptionHTML);

    // Create an expanding section if any of these are present..
    if (d.resolved.extendedDescriptionHTML || (d.languageCodes && d.languageCodes.length)) {
      selection
        .append('div')
        .call(uiDisclosure(context, `community-more-${d.id}`, false)
          .expanded(false)
          .updatePreference(false)
          .label(t.html('success.more'))
          .content(showMore)
        );
    }

    let nextEvents = (d.events || [])
      .map(event => {
        event.date = parseEventDate(event.when);
        return event;
      })
      .filter(event => {      // date is valid and future (or today)
        const t = event.date.getTime();
        const now = (new Date()).setHours(0,0,0,0);
        return !isNaN(t) && t >= now;
      })
      .sort((a, b) => {       // sort by date ascending
        return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      })
      .slice(0, MAXEVENTS);   // limit number of events shown

    if (nextEvents.length) {
      selection
        .append('div')
        .call(uiDisclosure(context, `community-events-${d.id}`, false)
          .expanded(false)
          .updatePreference(false)
          .label(t.html('success.events'))
          .content(showNextEvents)
        )
        .select('.hide-toggle')
        .append('span')
        .attr('class', 'badge-text')
        .html(nextEvents.length);
    }


    function showMore(selection) {
      let more = selection.selectAll('.community-more')
        .data([0]);

      let moreEnter = more.enter()
        .append('div')
        .attr('class', 'community-more');

      if (d.resolved.extendedDescriptionHTML) {
        moreEnter
          .append('div')
          .attr('class', 'community-extended-description')
          .html(d.resolved.extendedDescriptionHTML);
      }

      if (d.languageCodes && d.languageCodes.length) {
        const languageList = d.languageCodes
          .map(code => localizer.languageName(code))
          .join(', ');

        moreEnter
          .append('div')
          .attr('class', 'community-languages')
          .html(t.html('success.languages', { languages: languageList }));
      }
    }


    function showNextEvents(selection) {
      let events = selection
        .append('div')
        .attr('class', 'community-events');

      let item = events.selectAll('.community-event')
        .data(nextEvents);

      let itemEnter = item.enter()
        .append('div')
        .attr('class', 'community-event');

      itemEnter
        .append('div')
        .attr('class', 'community-event-name')
        .append('a')
        .attr('target', '_blank')
        .attr('href', d => d.url)
        .html(d => {
          let name = d.name;
          if (d.i18n && d.id) {
            name = t(`community.${communityID}.events.${d.id}.name`, { default: name });
          }
          return name;
        });

      itemEnter
        .append('div')
        .attr('class', 'community-event-when')
        .html(d => {
          let options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
          if (d.date.getHours() || d.date.getMinutes()) {   // include time if it has one
            options.hour = 'numeric';
            options.minute = 'numeric';
          }
          return d.date.toLocaleString(localizer.localeCode(), options);
        });

      itemEnter
        .append('div')
        .attr('class', 'community-event-where')
        .html(d => {
          let where = d.where;
          if (d.i18n && d.id) {
            where = t(`community.${communityID}.events.${d.id}.where`, { default: where });
          }
          return where;
        });

      itemEnter
        .append('div')
        .attr('class', 'community-event-description')
        .html(d => {
          let description = d.description;
          if (d.i18n && d.id) {
            description = t(`community.${communityID}.events.${d.id}.description`, { default: description });
          }
          return description;
        });
    }
  }


  success.changeset = function(val) {
    if (!arguments.length) return _changeset;
    _changeset = val;
    return success;
  };


<<<<<<< HEAD
  success.location = function(val) {
    if (!arguments.length) return _location;
    _location = val;
    return success;
  };


  return utilRebind(success, dispatch, 'on');
=======
    return utilRebind(success, dispatch, 'on');
>>>>>>> af4ea2c4ddd394e18be57c4998a7860f8e535444
}
