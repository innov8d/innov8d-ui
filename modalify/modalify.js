/* 
	Copyright (C) 2011 Dan Pratt (dpratt@innov8d.com)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is furnished to do
	so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE. 
	
	Requires on jQuery and jQueryUI position module.
*/

(function() {
    var $ = jQuery;

    var _initialized = false,
        _activeModal = null,
        _methods = {
            init: init,
            open: open,
            close: close,
            "set-trigger": trigger,
            center: center
        };

    $.fn.modalify = function(method) {
        if (_methods[method]) {
            return _methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return _methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.modalify');
        }
    };

    return;

    function init(options) {
        var activeOptions = $.extend({
	            maskClass: "overlay",
	            maskOpenClass: "overlay-open",
	            modalOpenClass: "modal-open",
	            closeClass: "modal-close",
	            outerWrapperClass: "outer",
	            innerWrapperClass: "inner",
	            contentPadding: 35,
	            trigger: null,
	            onResize: null
	        }, options);

        if (!_initialized) {
            var mask = $("<div class=\"" + activeOptions.maskClass + "\"></div>");
            mask.click(onMaskClick);
            
            $("body")
            	.append(mask)
	            .keydown(onCancel);

            $(window)
            	.resize(onResize);
            
            _initialized = true;
        }

        return this.each(modalize);

        function modalize(i, content) {
            var $content = $(content).wrap("<div class=\"" + activeOptions.outerWrapperClass + "\">" 
            		+ "<div class=\"" + activeOptions.innerWrapperClass + "\"></div>" 
            		+ "<a href=\"#\" class=\"" + activeOptions.closeClass + "\">X</a></div>"),
                $modal = $content.parent().parent();
                $closeLink = $modal.find("." + activeOptions.closeClass);
            
        	$content.show();
			activeOptions.$modal = $modal;
			activeOptions.$mask = $("." + activeOptions.maskClass);
			activeOptions.$closeLink = $closeLink;
            $("body").append($modal);
            $content.data("modalify", $.extend({}, activeOptions));
            $content.modalify("center");
        }
    }

    function center() {
        var $content = $(this),
            options = $content.data("modalify"),
            startHeight = options.$modal.height(),
            startWidth = options.$modal.width()
            isVisible = options.$modal.filter(":visible").length != 0;

		if (!isVisible) {
			options.$modal.css("zoom", "1");
			options.$modal.css("filter", "alpha(opacity=0)");
		    options.$modal.css("opacity", "0");
			options.$modal.css("display", "block");
		}

        options.$modal.css("height", "");

        if ($content.height() <= (options.$modal.height() - 2 * options.contentPadding)) {
            options.$modal.css("height", ($content.height() + 2 * options.contentPadding) + "px");
        }

        options.$modal.position({
            of: $(window),
            my: "center center",
            at: "center center"
        });

        if (options && options.onResize && ((startHeight != options.$modal.height()) || (startWidth != options.$modal.width()))) {
            options.onResize($content, $content.width(), $content.height());
        }

		if (!isVisible) {
			options.$modal.css("zoom", "");
			options.$modal.css("filter", "");
		    options.$modal.css("opacity", "");
			options.$modal.css("display", "");
		}
    }

    function open() {
        close();

        _activeModal = $(this);
        var options = _activeModal.data("modalify");
        options.$closeLink.click(onMaskClick);
        options.$mask.addClass(options.maskOpenClass);
        options.$modal.addClass(options.modalOpenClass);
        _activeModal.modalify("center");
    }

    function close() {
        if (_activeModal) {
            var options = _activeModal.data("modalify");
			options.$closeLink.unbind("click", onMaskClick);
        	options.$mask.removeClass(options.maskOpenClass);
        	options.$modal.removeClass(options.modalOpenClass);
            _activeModal = null;
        }
    }
    
    function trigger(triggerEl) {
    	var $modal = $(this);
    		
    	$(triggerEl).click(onTriggerClick);
    	return;
    	
    	function onTriggerClick(e) {
    		e.preventDefault();
    		e.stopPropagation();
    		
    		$modal.modalify("open");
    	}
    }
    
    // Event Handlers
    
    function onCancel(e) {
        if (_activeModal) {
            _activeModal.modalify("close");
        }
    }
    
    function onMaskClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (_activeModal) {
            _activeModal.modalify("close");
        }
    }

    function onResize() {
        if (_activeModal) {
            var options = _activeModal.data("modalify");

            _activeModal.modalify("center");
        }
    }
})();