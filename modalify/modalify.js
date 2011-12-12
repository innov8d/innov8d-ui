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
	            
            $(window).resize(onResize);
            
            _initialized = true;
        }

        return this.each(modalize);

        function modalize(i, content) {
            var $content = $(content).wrap("<div class=\"" + activeOptions.outerWrapperClass + "\">" 
            		+ "<div class=\"" + activeOptions.innerWrapperClass + "\" />" 
            		+ "<a href=\"#\" class=\"" + activeOptions.closeClass + "\">X</a></div>"),
                $modal = $content.parent().parent();
                $closeLink = $modal.find("." + activeOptions.closeClass);
            
            $("body").append($modal);
            $content.data("modalify", activeOptions);
        }
    }

    function center() {
        var $content = $(this),
            $modal = $content.parent().parent(),
            options = $content.data("modalify");

        $modal.css("height", "");

        if ($content.height() <= ($modal.height() - 2 * options.contentPadding)) {
            $modal.css("height", ($content.height() + 2 * options.contentPadding) + "px");
        }

        $modal.position({
            of: $("body"),
            my: "center center",
            at: "center center"
        });
    }

    function open() {
        close();
        
        _activeModal = $(this);
        var options = _activeModal.data("modalify");
        $closeLink.click(onMaskClick);
        
        $("." + options.maskClass).show();
        _activeModal.show();
        _activeModal.parent().parent().show();
        _activeModal.modalify("center");

    }

    function close() {
        if (_activeModal) {
            var options = _activeModal.data("modalify");
            $("." + options.maskClass).hide();
            _activeModal.parent().parent().hide();
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

            if (options && options.onResize) {
                options.onResize(_activeModal, _activeModal.width(), _activeModal.height());
            }
        }
    }
})();
