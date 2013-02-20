(function() {

  jQuery(function($) {
    var CLICK, DIV, confirmSelection, destroyModal, hideUselessInterface, loadVisualizationMapper, mapper, mapperBg, modal, modalBg, setCoordinates, setMapperEvents, setVisualizationId, setVisualizationListEvents, showMapper, showModalBigBox, showVisualizationDefiner, showVisualizationMapper;
    hideUselessInterface = function() {
      return $("#positioning, #visualization .visualization").hide();
    };
    hideUselessInterface();
    CLICK = "click";
    DIV = "<div/>";
    modal = null;
    modalBg = null;
    mapper = null;
    mapperBg = null;
    destroyModal = function(modal, modalBg, callback) {
      return modal.fadeOut(function() {
        modal.add(modalBg).remove();
        if (typeof callback === "function") {
          return callback();
        }
      });
    };
    confirmSelection = function() {
      return window.confirm("Confirm mapping position?");
    };
    setCoordinates = function(coordinates) {
      var positioning;
      positioning = $("#positioning");
      positioning.find(".positioning-coordinate-x1").val(Math.round(coordinates.x));
      positioning.find(".positioning-coordinate-y1").val(Math.round(coordinates.y));
      positioning.find(".positioning-coordinate-x2").val(Math.round(coordinates.x2));
      return positioning.find(".positioning-coordinate-y2").val(Math.round(coordinates.y2));
    };
    setVisualizationId = function(visualizationId) {
      return $("#visualization-id").val(visualizationId);
    };
    setMapperEvents = function(mapper) {
      var visualization, visualizationData;
      visualization = mapper.find("img");
      visualizationData = visualization.data();
      return visualization.Jcrop({
        boxWidth: mapper.width(),
        trueSize: [visualizationData.width, visualizationData.height],
        onSelect: function(coordinates) {
          if (confirmSelection()) {
            setCoordinates(coordinates);
            setVisualizationId($(visualization).data("id"));
            return destroyModal(mapper, mapperBg);
          }
        }
      });
    };
    showMapper = function(image) {
      var imageObject, mapperContent;
      if (!image) {
        return;
      }
      if (!mapper) {
        mapper = $(DIV, {
          id: "tv-mapper"
        }).hide();
        mapperBg = $(DIV, {
          id: "tv-modal-bg"
        }).on(CLICK, function() {
          return destroyModal(mapper, mapperBg);
        });
        $("body").append(mapper).append(mapperBg);
      }
      imageObject = $("<img/>", {
        src: image.src,
        data: {
          id: image.id,
          width: image.width,
          height: image.height
        }
      });
      mapperContent = $(DIV, {
        "class": "mapper-wrapper"
      }).append(imageObject);
      mapper.append(mapperContent);
      setMapperEvents(mapper);
      return mapper.fadeIn();
    };
    showVisualizationMapper = function(imageJson) {
      return destroyModal(modal, modalBg, function() {
        var image;
        image = JSON.parse(imageJson);
        return showMapper(image);
      });
    };
    loadVisualizationMapper = function(visualizationId) {
      var requestData;
      requestData = {
        action: "get_visualization_mapper",
        visualizationId: visualizationId
      };
      return $.post(ajaxurl, requestData, showVisualizationMapper);
    };
    setVisualizationListEvents = function(modal) {
      return modal.on(CLICK, ".image", function() {
        var visualizationId;
        visualizationId = $(this).parents("tr").data("visualizationId");
        return loadVisualizationMapper(visualizationId);
      });
    };
    showModalBigBox = function(html) {
      if (!html) {
        return;
      }
      if (!modal) {
        modal = $(DIV, {
          id: "tv-modal"
        }).hide();
        modalBg = $(DIV, {
          id: "tv-modal-bg"
        }).on(CLICK, function() {
          return destroyModal(modal, modalBg);
        });
        $("body").append(modal).append(modalBg);
      }
      modal.html(html);
      setVisualizationListEvents(modal);
      return modal.fadeIn();
    };
    showVisualizationDefiner = function(ev) {
      ev.preventDefault();
      return $.post(ajaxurl, {
        action: "get_visualizations_list"
      }, showModalBigBox);
    };
    return $("#visualization").on(CLICK, ".js-visualization-trigger", showVisualizationDefiner);
  });

}).call(this);
