(function(){
  var jQuery
  var $
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
    $ = jQuery
    main()
  }

  function tv_scriptLoadHandler() {
    jQuery = window.jQuery.noConflict(true)
    $ = jQuery
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

  var visualization = function (container) {
    var image = $("img", container)
    var imageWidth = $(image).width()
    var originalWidth = $(image).data("originalWidth")
    var visualizationRatio =  imageWidth / originalWidth
    var contents = $(".tv-map", container)

    var setPosition = function () {
      var contentData = $(this).data()
      var positioning = {
        left: (contentData.x1 * visualizationRatio) + "px",
        top: (contentData.y1 * visualizationRatio) + "px",
        height: (contentData.height * visualizationRatio) + "px",
        width: (contentData.width * visualizationRatio)+ "px"
      }
      $(this).css(positioning)
    }

    var destroyContentModal = function () {
      modal.fadeOut(function(){
        modal.hide().empty()
        modalBg.hide().empty()
      })
    }

    var showContentModal = function (html) {
      if (!html) return

      if (!modal) {
        modal = $("<div/>", {id:"tv-modal"}).hide()
        modalBg = $("<div/>", {id:"tv-modal-bg"}).on("click", destroyContentModal)

        $("body").append(modal).append(modalBg)
      }

      modal.html(html)
      modal.fadeIn()
      modalBg.fadeIn()
    }

    var requestContentModal = function (ev) {
      ev.preventDefault()

      var data = $(this).data()

      var requestData = {
        action: "get_visualization_content",
        contentId: data.id
      }

      $.post(ajaxurl, requestData, showContentModal)
    }

    $(contents).each(setPosition)
    $(container).on("click", ".tv-map", requestContentModal)
  }

  window.tech_visualization = function (data) {
    var $ = jQuery

    for (var i = data.css.length - 1; i >= 0; i--) {
      var cssHref = data.css[i]
      var css = $("<link>", {
        rel: "stylesheet",
        href: cssHref
      })
      css.appendTo("head")
    };

    container.html(data.html)

    $(".tv-visualization").each(function(){
      new visualization($(this))
    })
  }
})()