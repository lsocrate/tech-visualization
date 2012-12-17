jQuery(function($){
  var modal;

  var showModalBigBox = function (html) {
    if (!html) {
      return;
    }

    if (!modal) {
      modal = $("<div/>", {id:"tv-modal"})

      $("body").append(modal)
    }

    modal.html(html).show()
  }
  var showVisualizationDefiner = function (ev) {
    ev.preventDefault()

    var requestData = {
      action: "get_visualizations_list"
    }

    $.post(ajaxurl, requestData, showModalBigBox)
  }

  $("#visualization").on("click", ".js-visualization-trigger", showVisualizationDefiner)
})