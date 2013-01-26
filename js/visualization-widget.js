(function(){
  var jQuery
  var ajaxurl = "http://tech.dev/wp-admin/admin-ajax.php?callback=?"
  var container

  if (typeof window.jQuery == "undefined") {
    var scriptTag = document.createElement("script")
    scriptTag.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js")

    if (scriptTag.readyState) {
      scriptTag.onreadystatechange = function () {
        if (this.readyState == "complete" || this.readyState == "loaded") {
          tv_scriptLoadHandler()
        }
      }
    } else {
      scriptTag.onload = tv_scriptLoadHandler
    }

    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag)
  } else {
    jQuery = window.jQuery
    main()
  }

  function tv_scriptLoadHandler() {
    jQuery = window.jQuery.noConflict(true)
    main()
  }

  function main() {
    jQuery(document).ready(function($) {
      container = $("#envisioning-technology-visualization")

      var requestData = {
        action: "get_visualization",
        visualizationId: container.data("visualizationId")
      }
      $.getJSON(ajaxurl, requestData)
    })
  }

  window.jsonp_transfer = function (json_data) {
    var $ = jQuery
  }
})()