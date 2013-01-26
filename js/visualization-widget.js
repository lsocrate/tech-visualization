(function(){
  var jQuery
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
    })
  }
})()