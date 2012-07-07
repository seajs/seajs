/**
 * Thanks to https://github.com/lepture/github.js
 */
define('github', [], function(require, exports, module) {

  var API_BASE = 'https://api.github.com'
  var CALLBACK = 'callback=define'


  function GitHub(name) {
    if (!(this instanceof GitHub)) {
      return new GitHub(name)
    }

    var parts = name.split('/')
    this.user = parts[0]
    this.repos = parts[1]
    this.root = API_BASE + '/repos/' + this.user + '/' + this.repos
  }

  module.exports = GitHub


  GitHub.prototype.issues = function(options) {
    options = options || {}
    var url =  this.root + '/issues?' + CALLBACK

    var qs = toQuery(
        options,
        [
          'sort:updated', 'state', 'milestone', 'labels',
          'page', 'per_page:20'
        ]
    )
    url += '&' + qs

    require.async(url, function(response) {
      render('issues', response.data, issue2html)
    })

    return this
  }

  GitHub.prototype.commits = function(options) {
    options = options || {}

    var url =  this.root + '/commits?' + CALLBACK
    url += '&' + toQuery(options, ['page', 'per_page:10'])

    require.async(url, function(response) {
      render('commits', response.data, commit2html)
    })

    return this
  }


  // Helpers
  // -------

  function render(target, items, toHTML) {
    var html = ''

    for(var i = 0; i < items.length; i++) {
      html += toHTML(items[i])
    }

    document.getElementById(target).innerHTML = html
  }

  function issue2html(data) {
    var html = '<li>'

    if (data.labels.length) {
      html += '<span class="label">[' + data.labels[0].name + ']</span>'
    }

    html += '<a href="' + data.html_url + '" target="_blank">' + data.title + '</a>'
    html += '<span class="date">' + prettyDate(data.updated_at) + '</span>'
    html += '</li>'

    return html
  }

  function commit2html(data) {
    var commit = data.commit

    var html = '<li>'
    html += '<a href="' + data.url + '" target="_blank">' + commit.message + '</a>'
    html += '<span class="date">' + prettyDate(commit.committer.date) + '</span>'
    html += '</li>'

    return html
  }

  function toQuery(options, keys) {
    var query = []

    for (var i = 0; i < keys.length; i++) {
      var parts = keys[i].split(':')

      var key = parts[0]
      var value = options[key] || parts[1]

      if (value) {
        query.push(key + '=' + value)
      }
    }

    return query.join('&')
  }

  function prettyDate(time) {
    if (navigator.appName === 'Microsoft Internet Explorer') {
      // because IE date parsing isn't fun.
      return "<span>&infin;</span>"
    }

    var say = {
      just_now: " now",
      minute_ago: "1m",
      minutes_ago: "m",
      hour_ago: "1h",
      hours_ago: "h",
      yesterday: "1d",
      days_ago: "d",
      last_week: "1w",
      weeks_ago: "w"
    }

    var current_date = new Date(),
        current_date_time = current_date.getTime(),
        current_date_full = current_date_time + 60000,
        date = new Date(time),
        diff = ((current_date_full - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400)

    if (isNaN(day_diff) || day_diff < 0) return "<span>&infin;</span>"

    return day_diff === 0 && (
        diff < 60 && say.just_now ||
            diff < 120 && say.minute_ago ||
            diff < 3600 && Math.floor(diff / 60) + say.minutes_ago ||
            diff < 7200 && say.hour_ago ||
            diff < 86400 && Math.floor(diff / 3600) + say.hours_ago) ||
        day_diff === 1 && say.yesterday ||
        day_diff < 7 && day_diff + say.days_ago ||
        day_diff === 7 && say.last_week ||
        day_diff > 7 && Math.ceil(day_diff / 7) + say.weeks_ago
  }


})
