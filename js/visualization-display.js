(function() {

  jQuery(function($) {
    var Visualization;
    Visualization = (function() {
      var PX, ajaxurl, checkHashAndRequestModalIfNeeded, cleanHash, destroyContentModal, requestContentModalForTechnologyId, scrollToVisualization, setHashForTechnologySlug, setPosition, setTechnologyHashSlug, showContentModal;

      ajaxurl = null;

      PX = "px";

      Visualization.modal = null;

      Visualization.modalBg = null;

      cleanHash = function() {
        return window.location.hash = "";
      };

      setPosition = function(area, ratio) {
        var contentData, positioning;
        contentData = $(area).data();
        positioning = {
          left: (contentData.x1 * ratio) + PX,
          top: (contentData.y1 * ratio) + PX,
          height: (contentData.height * ratio) + PX,
          width: (contentData.width * ratio) + PX
        };
        return $(area).css(positioning);
      };

      setHashForTechnologySlug = function(technologySlug) {
        var newHash, newHashRegex, oldHash;
        oldHash = window.location.hash;
        newHash = "technology-" + technologySlug;
        window.location.hash = newHash;
        newHashRegex = new RegExp("^#?" + newHash + "$");
        return !oldHash.match(newHashRegex);
      };

      destroyContentModal = function() {
        var _this = this;
        if (this.modal != null) {
          return this.modal.fadeOut(function() {
            return _this.modal.add(_this.modalBg).hide().empty();
          });
        }
      };

      scrollToVisualization = function(container) {
        var scrollPosition, visualizationBottom, visualizationTop;
        scrollPosition = $(document).scrollTop();
        visualizationTop = $(container).offset().top;
        visualizationBottom = visualizationTop + $(container).height();
        if (scrollPosition < visualizationTop || scrollPosition > visualizationBottom) {
          return $(document).scrollTop(visualizationTop);
        }
      };

      showContentModal = function(html, callback) {
        var modalPosition;
        if (!html) {
          return;
        }
        if (!this.modal) {
          this.modal = $("<div/>", {
            id: "tv-modal"
          }).hide();
          this.modalBg = $("<div/>", {
            id: "tv-modal-bg"
          }).on("click", cleanHash);
          $("body").append(this.modal).append(this.modalBg);
        }
        if (typeof callback === "function") {
          callback();
        }
        modalPosition = ($(document).scrollTop() + 20) + PX;
        this.modal.html(html).css("top", modalPosition);
        return this.modal.add(this.modalBg).fadeIn();
      };

      requestContentModalForTechnologyId = function(technologyId, callback) {
        var requestData;
        requestData = {
          action: "get_visualization_content",
          contentId: technologyId
        };
        if (this.isWidget) {
          return $.getJSON(ajaxurl, requestData);
        } else {
          return $.post(ajaxurl, requestData, function(html) {
            return showContentModal(html, callback);
          });
        }
      };

      checkHashAndRequestModalIfNeeded = function(visualization, ev) {
        var callback, hash, matches, technology, technologySlug;
        hash = window.location.hash;
        if (!hash || hash === "#") {
          return destroyContentModal();
        }
        matches = hash.match(/#technology\-(.*)$/);
        technologySlug = matches != null ? matches[1] : void 0;
        if (technologySlug) {
          technology = $(visualization.contents).filter("[data-slug=" + technologySlug + "]");
          if (technology) {
            if (!ev) {
              callback = scrollToVisualization(visualization.container);
            }
            return requestContentModalForTechnologyId(technology.data("id"), callback);
          }
        }
      };

      setTechnologyHashSlug = function(ev) {
        var technologySlug;
        ev.preventDefault();
        technologySlug = $(this).data("slug");
        if (technologySlug) {
          return setHashForTechnologySlug(technologySlug);
        }
      };

      function Visualization(container, ajaxTargetUrl, isWidget) {
        var image, visualizationRatio,
          _this = this;
        this.container = container;
        this.isWidget = isWidget != null ? isWidget : false;
        ajaxurl = ajaxTargetUrl;
        this.contents = $(".tv-map", this.container);
        image = $("img", this.container);
        visualizationRatio = image.width() / image.data("originalWidth");
        this.contents.each(function() {
          return setPosition(this, visualizationRatio);
        });
        this.container.on("click", ".tv-map", setTechnologyHashSlug);
        window.showContentModal = this.showContentModal;
        window.onhashchange = function(ev) {
          return checkHashAndRequestModalIfNeeded(_this, ev);
        };
        checkHashAndRequestModalIfNeeded(this);
      }

      return Visualization;

    })();
    return $(".tv-visualization").each(function() {
      return new Visualization($(this), TVAjax.ajaxurl);
    });
  });

}).call(this);
