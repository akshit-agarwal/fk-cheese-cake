/*
 * Class for storing/retrieving data from window.location.hash
 * eg- FKART.locationHash.get("pageno"), FKART.locationHash.set("pageno",5);
 */
var FKART = FKART || {};
FKART.locationHash = (function(){
	var dict = {};
	var initialized = false;
	
	function init() {
		readValues();
		initialized = true;
	};
	
    function setParam(key,value) {
		dict[key] = value;
		writeValues();
	};
	function getParam(key) {
		if (!initialized)
			init();
		return dict[key];
	};
	function getTypedValue(value) {
		if (!isNaN(value))
			return Number(value);
		if(value == "true")
			return true;
		if(value == "false")
			return false;
		return value;
	}
	function readValues() {
		if((window.location.hash).indexOf('#')>-1){
			var params = window.location.hash.substring(1).split(";");
			for(var i in params) {
			  var param = params[i].split("=");
			  if (param.length==2){
				  dict[unescape(param[0])] = getTypedValue(unescape(param[1]));
			  }
			}
		}
	};
	function writeValues() {
		var params = [];
		for(var key in dict) {
			params.push(escape(key)+"="+escape(dict[key]));
		}
		window.location.hash = "#"+params.join(";");
	};
	
	function delParam(key){
		delete dict[key];
		writeValues();
	}
	
	function getAll() {
		 var copy = {};
		   for (var i in dict) {
		    if (dict.hasOwnProperty(i)) {
		     copy[i] = dict[i];
		    }
		   }
		   return copy;
	}
	
	return {
		get: function (key){
			return getParam(key);
		},
		set: function (key,value){
			return setParam(key,value);
		},
		del: function (key) {
			return delParam(key);
		},
		getAll: function(){
			return getAll();
		}
	};
})();

/*
 * Reusable UI element classes
 * 
 */


FKART.ui = {};
FKART.ui.isDialogOpen = false;
FKART.ui.isDialogDataAjax = false;

FKART.ui.goTop = (function(){
	var handle = null, blocked = false;
	function init(cssClass) {
		handle = $(document.createElement("div")).addClass("fk-ui-goTop")
												 .addClass("fk-hidden")
												 .text("Go to top.")
												 .appendTo("body");
		if(cssClass)
			handle.addClass(cssClass);
		$(window).scroll(checkScrollPos);
        handle.click(toTop);
	}

	function toTop(){
			blocked = true;
			$('html, body').animate({scrollTop:0}, 'slow',function(){
				handle.fadeOut("fast");
				blocked = false;
			});
	}

	function show() {
		   	handle.fadeIn("fast");
	}

	function hide() {
			handle.fadeOut("fast");
	}

	function checkScrollPos() {
		var dh = $(document).height();
		var wh = $(window).height();
		var scrollTop = $(window).scrollTop();
		//we show go to top only when the scrollbar is in middle of page;
		if(this.blocked)
			return; // we are animating, don't toggle
		var mid = (dh- wh)/2;
		if(mid < scrollTop)
					show();
		else
					hide();

	}

    function destroy() {
        handle.hide().remove();
        $(window).unbind("scroll",checkScrollPos);
    }

	return {
        init: init,
        show: show,
        hide: hide,
        toTop: toTop,
        getHandle: function() {
                        return handle;
                   },
        destroy: destroy
    };
    
}());


/*
 * Creates at tooltip with a given content near nearElement. 
 * The content can be html or a DOM element to be placed inside tooltip
 * params: message, nearElement, cssClass  ...
 */
FKART.ui.Tooltip = function(params) {
    params.showCloseIcon = (typeof params.showCloseIcon == 'undefined') ? true : params.showCloseIcon;
    params.extraHoverArea = params.extraHoverArea || false;
    params.message = params.message || $(params.nearElement).attr('data-tooltip-title');

    var ajax_loaded = false;
	var $container = $(document.createElement("div")).addClass("fk-ui-tooltip");
	if(params.cssClass)  {
        $container.addClass(params.cssClass);
    }
    params.align = params.align || "middle";
    $container.addClass(params.align);

    if(params.ajaxUrl) {
        params.message = params.message || "Loading...";
    }

    if (params.showCloseIcon) {
        var $closeButton = $(document.createElement("span")).addClass("fk-ui-tooltip-close").appendTo($container);
        $closeButton.click(function(){
            $container.hide();
        });
    }

	var $arrow = $(document.createElement("span")).addClass("fk-ui-tooltip-arrow").appendTo($container);
    if(params.extraHoverArea) {
        var $hoverArea = $($dc("hover-area")).appendTo($container);
    }
	var $content;
	if(typeof params.message === "string"){
		$content = $(document.createElement("div")).addClass("fk-ui-tooltip-content").html(params.message).appendTo($container);
	} else {
		$(params.message).data("parent",$(params.message).parent());
		$content = $(params.message).remove().appendTo($container).addClass("fk-ui-tooltip-content");
        	$content.css("display","block");
	}
	$container.appendTo("body");
    var $nearElement = $(params.nearElement);

    function load_ajax() {
        if(!ajax_loaded){
            $content.load(params.ajaxUrl, function(responseText, textStatus){
                reposition();
                if(textStatus === "success"){
                    ajax_loaded = true;
                }
            });
        }
    }

    function reposition(ele) {
        if (typeof ele != 'undefined') {
            $nearElement = $(ele);
        }
		var near_element_offset = $nearElement.offset(),
            near_element_width =  $nearElement.outerWidth(),
            near_element_height = $nearElement.outerHeight();
        
        switch (params.align) {
            case "middle":  //TODO::aakash: get rid of these confusing param values completely.
            case "b-middle":
                var left = near_element_offset.left + near_element_width/2 - $container.outerWidth()/2;
                if(left < 0){
                    left = near_element_offset.left + 5;
                }
                if((left + $container.outerWidth()) > $(window).width()){
                    left = $(window).width() -  $container.outerWidth()-5;
                }
                var arrow_pos = 10;
                arrow_pos = near_element_width/2;

                if(arrow_pos < near_element_offset.left  || arrow_pos > near_element_offset.right){
                    arrow_pos = near_element_width/2 +  near_element_offset.left - left;
                }
                $container.find('.fk-ui-tooltip-arrow').css({'left': arrow_pos});
                $container.css({'left':left,
	    	                     'top' :near_element_offset.top + near_element_height+3
                              });
                              break;
            case "left":
            case "b-left":    $container.css({'left':near_element_offset.left,
	    	                                  'top' :near_element_offset.top + near_element_height+5
                                             });
                              break;
            case "right":
            case "b-right":   $container.css({'right':$(window).width()-$nearElement.width()-near_element_offset.left-25,
                                              'top'  :near_element_offset.top + near_element_height+5
                                             });
                              break;
            case "l-middle":  $container.css({'right':$(window).width()-near_element_offset.left +5,
                                              'top'  :near_element_offset.top + near_element_height/2 - $container.outerHeight()/2
                                             });
                              break;
            case "auto":  
            	var container_height = $container.outerHeight();
                var right = $(window).width() - (near_element_offset.left + near_element_width + $container.outerWidth() + 5);
            	var top = near_element_offset.top + near_element_height/2 - container_height/2;

            	$container.removeClass('r-middle');
            	$container.removeClass('l-middle');
            	var alignClass = 'r-middle';
            	if(right < 0){
            		right = $(window).width() - (near_element_offset.left) + 5;
            		alignClass = 'l-middle';
            	}

            	var arrowTop = "45%";
                if(container_height < 100){
                    arrowTop = container_height/2 - 14;
                }
            	if(top < $(window).scrollTop()){
            		top = $(window).scrollTop();
            		arrowTop = (near_element_height - $(window).scrollTop() + near_element_offset.top)/2 - 14;
            	}else if(top + container_height > $(window).scrollTop() + $(window).height()){
            		top = $(window).scrollTop() + $(window).height() - container_height;
            		arrowTop = near_element_offset.top - top + (top + container_height - near_element_offset.top)/2 - 14;
            	}
             	$container.css({
             		'right':right,
             		'top'  :top
             	});
           		$container.find('.fk-ui-tooltip-arrow').css({'top': arrowTop});
                $container.addClass(alignClass);
            	break;

        }
	}

    return {
    	hide : function() {
    			$container.fadeOut(100);
                $container.trigger("afterHide");
    	},
    	show : function(ele) {
    			$container.hide();
    			//re-position because the original element might have moved.
    			reposition(ele);
               if(params.ajaxUrl){
                    load_ajax();
                }
                $container.fadeIn(100);
                $container.trigger("afterShow");
    	},
        updateContent : function(html) {
                $content.html(html);
        },
    	getContainer : function() {
    		return $container;
    	},
    	destroy : function() {
    		var $content = $container.find(".fk-ui-tooltip-content");
    		if($content.data("parent")) {
    			$content.remove().hide().data("parent").append($content);
    		}
    		$container.remove();
    	},
        bindEvent:function(event_name,callback){
            $container.bind(event_name,callback);
        },
        unbindEvent:function(event_name,callback){
            $container.unbind(event_name,callback);
        }
    };
};
FKART.ui.HoverTooltip = function(params) {
    params.extraHoverArea = params.extraHoverArea==null ? true : params.extraHoverArea;
    params.attachTo = params.attachTo || params.nearElement;
    params.destroyTimeout =  params.destroyTimeout==null? 5000 : params.destroyTimeout;
    var tooltip, $tooltip_container, destroy_timeout;

    $(params.attachTo).delayedHover(function() {
        if (destroy_timeout) {
            clearTimeout(destroy_timeout);
        }
        if (typeof tooltip === "undefined" || tooltip === null) {
            tooltip_init();
        }
        tooltip.show(this);
    }, function(e) {
        if ($(e.relatedTarget).parents().filter($tooltip_container).length == 1)
            return;
        tooltip.hide();
        try_destroy_tooltip();
    });

    function bind_tooltip_handlers() {
        $($tooltip_container).delayedHover(function(){
            tooltip.show();
        }, function(e) {
            if ($(e.relatedTarget).parents().filter(params.attachTo).length == 1)
                return;
            tooltip.hide();
            try_destroy_tooltip();
        });
    }

    function try_destroy_tooltip() {
        if (destroy_timeout) {
            clearTimeout(destroy_timeout);
        }
        if(params.destroyTimeout > 0) {
             destroy_timeout = setTimeout(function() {
                tooltip.destroy();
                tooltip = null;
            }, params.destroyTimeout);
        }
    }

    function tooltip_init() {
        tooltip = new FKART.ui.Tooltip(params);
        $tooltip_container = tooltip.getContainer();
        bind_tooltip_handlers();
    }

    return tooltip;
};




/*
 * Popup, creates Non window blocking popup with given header and message.
 * params : header, message, nearElement, cssClass, repositionCallback
 */
FKART.ui.Popup = function (params) {
	
	var $container = $(document.createElement("div")).addClass("fk-ui-popup");
	var $innerContainer = $(document.createElement("div")).addClass("fk-ui-popup-container").appendTo($container);
	if(params.cssClass)
		$container.addClass(params.cssClass);
	var $header = $(document.createElement("div")).addClass("fk-ui-popup-header").html(params.header);
	var $closeButton = $(document.createElement('button')).addClass("fk-ui-popup-closebutton")
														  .appendTo($header);
	$closeButton.click(function(){
		publicInterface.hide();
	});
	$header.appendTo($innerContainer);
	
	if(params.message) {
		if(typeof(params.message) == "string") {
			$(document.createElement("div")).addClass("fk-ui-popup-message").html(params.message).appendTo($innerContainer);
		} else {
			$(params.message).data("parent", $(params.message).parent());
			$(params.message).remove().addClass("fk-ui-popup-message").appendTo($innerContainer).css({"display":"block"});
		}
	}
	
	$container.appendTo("body");
	var $nearElement = $(params.nearElement);	
	function reposition() {
			var eleOffset = $nearElement.offset();
			var currentPos = {};
			currentPos.left = eleOffset.left + $nearElement.outerWidth()/2 - $container.outerWidth()/2;
			currentPos.top =  eleOffset.top + $nearElement.outerHeight()+3;
		    $container.css({'left': currentPos.left  
		    				,'top':currentPos.top});
		    return currentPos;
		};
		
	function documentClick(e) {
		var $target = $(e.target);
		if(!$target.parents().is(".fk-ui-popup")){
			publicInterface.hide();
		} 
	}
	function windowKeypress(e) {
		if(e.keyCode == 27) {
			publicInterface.hide();
		}	
	}
	
	var publicInterface = {
		show: function(){
				var currentPos = reposition();
				if (params.repositionCallback) {
					params.repositionCallback.call($container,currentPos);
				}
				$container.show();
				$(window).keydown(windowKeypress);
				setTimeout(function(){
					$(document).click(documentClick);
				},2000);

			},
        changeContent: function(new_content){
              $(".fk-ui-popup-message",$container).html(new_content);
        },
        changeNearElement: function(ele) {
               $nearElement = $(ele);
               reposition();
        },
		hide: function(){
				$container.hide();
				$(document).unbind("click",documentClick);
				$(window).unbind("keydown",windowKeypress);
			},
		getContainer: function(){
				return $container;
			}	
	};
	
	return publicInterface;
};

FKART.ui.Loader = function(params) {
	params.loaderImg = params.loaderImg || "/images/ajax-loader.gif";
	var $img = $(document.createElement("img")).attr("src",params.loaderImg).addClass("fk-ui-loader");
	if(params.cssClass)
		$img.addClass(cssClass);
	$img.appendTo($(params.ele));
	
	return {
		show:function(){
			$img.css("visibility","visible");
		},
			hide:function(){
			$img.css("visibility","hidden");
		},
			getContainer:function(){
				return $img;
		}
	};
	
};

FKART.ui.Alert = FKART.Alert = function(options){
    this.body = options['body'];
    this.width = options['width'];
    this.head = options['head'] ? options['head'] : '';
    this.buttons = options['buttons'] ? options['buttons'] : null;
    this.destroyOnClose = options['destroy_on_close'] ? options['destroy_on_close'] : false;
    
    this.html;
    
    var shield = null;
    var self = this;

    this.keyPress = function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code === 27) {
            self.close();
        }
    };

    this.show = function(){
        $(document).bind('keyup', this.keyPress);
        this.html.show();
        shield.show();    
    };
    
    this.close = function(){
        $(document).unbind('keyup', this.keyPress);
        if(this.destroyOnClose){
        	this.html.remove();
        }else{
        	this.html.hide();
    	}
        shield.hide();
    };
    
    this.init = function(){
        this.html = '<div class="fk-alrt" style="width: ' + this.width + 'px;">';
        if(this.head){
            this.html += '<div class="hd">' + this.head + '</div>';
        }
        this.html += '<div class="bd">' + this.body + '</div>';
        this.html += '<div class="fd">';
        
        if(this.buttons){
            for(var id in this.buttons){
                this.html += '<span id="' + id + '" class="fk-but2">' + this.buttons[id] + '</span>';
            }
        }
        this.html += '<span class="cls">&nbsp;</span>';
        this.html += '</div>';
        this.html += '</div>';
        this.html = $(this.html);
        $('body').append(this.html);
        var top = ($(window).height() - this.html.height()) / 2 + $(window).scrollTop();
        var left = ($(window).width() - this.html.width()) / 2;
        this.html.css({'top': top + 'px', 'left': left + 'px'});
        if(!$('.fk-shld').length){
            shield = $('<div class="fk-shld"></div>');
            $('body').append(shield);
        }else{
            shield = $('.fk-shld');
            shield.show();
        }
        var shdHeight = $('body').height();
        if(shdHeight < $(window).height()){
            shdHeight = $(window).height();
        }
        shield.height(shdHeight);
        shield.width($('body').width());

        shield.one("click",function(){
             self.close();
        });

        $('.cls', this.html).click(function(){
            self.close();
        });
        
        this.show();
        
    };

    this.init();
    
    return this;
};

FKART.ui.Dialog = function(params) {
        params.width = params.width || "50%";
        params.height = params.height || "auto";
        params.showFooter = params.showFooter!=null? params.showFooter : true;
        params.showCloseIcon = params.showCloseIcon!=null? params.showCloseIcon : true;
        params.modal = params.modal!=null? params.modal : true;
        params.header = params.header || false;
        var is_open = false;
        var is_ajax = params.is_ajax || false;
        FKART.ui.isDialogDataAjax = is_ajax;
        var resetFormFlag = params.resetFormFlag!=null? params.resetFormFlag : false;
        var $container = $(document.createElement("div")).addClass("fk-ui-dialog");
        if(params.cssClass)
            $container.addClass(params.cssClass);
        var $window = $(document.createElement("div"));

        if(params.modal){
             var $shield = $(document.createElement("div"));
             $shield.addClass("shield").appendTo($container);
             if($.browser.msie && $.browser.version=="6.0"){
                 $shield.css("height",$(document).height()+"px");
             }
        }

        $window.addClass("window alpha30").appendTo($container);
        $window.css({width:params.width,height:params.height});
        var $window_content = $(document.createElement("div"));
        $window_content.addClass("content").appendTo($window);

        var $header = $($dc("dialog-header"));
        if(params.header) {
            updateHeaderText(params.header);
        }
        var $body = $($dc("dialog-body"));
        updateContent(params.body);
        if(params.height != "auto"){
            updateBodyHeight();
        }
        if(params.showFooter){
            var $footer = $(document.createElement("div")).addClass("dialog-footer line").appendTo($window);
            $footer.append($(document.createElement("div")).addClass("close-button close").text("Close window"));
            $footer.append($(document.createElement("div")).addClass("fclear"));
        }

        if(params.showCloseIcon){
            var $closeIcon = $(document.createElement("span")).addClass("close-icon close");
            if(params.header){
                $closeIcon.addClass("header-close-icon");
            }
            $closeIcon.appendTo($window);
        }

        $container.appendTo("body");

        function reposition() {
            var top = ($(window).height() - $window.height()) / 2;
            var left = ($(window).width() - $window.width()) / 2;
            top = top>0? top : 5;
            left = left>0? left : 5;
            if($window.outerHeight() > $(window).height() || $window.outerWidth() > $(window).width()) {
                $window.addClass("window-absolute");
                top = top + $(window).scrollTop();
            } else {
                $window.removeClass("window-absolute");
            }
            $window.css({'top': top + 'px', 'left': left + 'px'});

        }

    function loadURL(url, onLoadCallback) {
        var dialogBody = $('.dialog-body');
        dialogBody.on('click', 'a.load-within-dialog', function(event) {
            event.preventDefault();
            dialogBody.load($(event.target).attr('href'));
        })

        dialogBody.on('form.load-within-dialog').submit(function(event) {
            event.preventDefault();
            var target = $(event.target);
            var action = target.attr('action');
            var formData = target.serialize();
            $.ajax({url: action, data: formData,
                success: function(response) {
                    dialogBody.html(response);
                },
                beforeSend: function() {
                    FKART.utils.loader.show();
                },
                complete: function() {
                    FKART.utils.loader.hide();
                }
            });
        });
        if (typeof(onLoadCallback) != "undefined") {
            onLoadCallback(this);
        }
        dialogBody.load(url);
    }


        $container.find(".close").live("click",function(){
            hideDialog();
        });

        function updateHeaderText(headersection){
           if(typeof headersection != "string"){
                $(headersection).appendTo($header).css({"display":"block"});
            } else {
                 $header.text(headersection);
            }
            $header.appendTo($window_content);
        }

        function updateContent(content){
           if(typeof content != "string"){
                $(content).appendTo($body).css({"display":"block"});
            } else {
                $body.append(content);
            }
            $body.appendTo($window_content);
        }

        function keyup(e){
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code === 27) {
                hideDialog();
            }
        }

        function updateHeader(str) {
            $container.find('.dialog-header').html(str);
        }

        function setWidth(width) {
            $window.css('width', width);
            reposition();
        }

        function updateBodyHeight(){
            var cal_height = $window.height() - $header.innerHeight();
            if(cal_height > 0){
                $body.css({height:cal_height, overflow:"auto"});
            }
        }
        function setHeight(height) {
            $window.css('height', height);
            updateBodyHeight();
            reposition();
        }

        function showDialog() {
            if(FKART.ui.isDialogOpen == false){
                is_open = true;
                FKART.ui.isDialogOpen = true;
                if(params.height != "auto"){
                    updateBodyHeight();
                }
                reposition();
                $container.trigger("beforeShow");
                $container.css("visibility","visible");
                $container.trigger("afterShow");
                $(document).bind("keyup",keyup);

                $(".dialog-body .form-validate").each(function(){
                   var formid = $(this).attr("id");
                   if(resetFormFlag){
                       $("#"+formid).each(function(){
                           this.reset();
                       });
                   }
                   $("#"+formid).validate();
                });
                $(".scroll-section").scroll(function(){close_tool_tip();});
            }
        };

        function hideDialog() {
            $container.trigger("beforeHide");
            $container.css("visibility","hidden");
            is_open = false;
            FKART.ui.isDialogOpen = false;
            FKART.ui.isDialogDataAjax = false;
            $container.trigger("afterHide");
            if(is_ajax){
                $body.children().empty().appendTo("body").css({"display": "none"});
            }else{
                $body.children().appendTo("body").css({"display": "none"});
            }
            if($header){
                $header.children().appendTo("body").css({"display": "none"});
            }
            $container.remove();
            $(document).unbind("keyup",keyup);
        };

        function updateBody(body) {
          $(".dialog-body").html(body);
        };

        function body() {
          return $(".dialog-body");
        };

        return {
            show: showDialog,
            hide: hideDialog,
            update: updateBody,
            body: body,
            loadURL: loadURL,
            updateHeader: updateHeader,
            setWidth: setWidth,
            setHeight: setHeight,
            bindEvent:function(event_name,callback){
                $container.bind(event_name,callback);
            },
            unbindEvent:function(event_name,callback){
                $container.unbind(event_name,callback);
            },
            isOpen : function() {
                return is_open;
            },
            getContainer:function(){
                return $container;
            },
            reposition:reposition
        };
};


//
// delayed hover jquery ext
//
(function($) {
    //
// plugin definition
//
    $.fn.delayedHover = function(mouseenter, mouseleave, delay) {
        delay = delay || 200;
        return this.each(function() {
            var $this = $(this);
            var locked = null;
            $this.bind("mouseenter", function(e) {
                locked = true;
                setTimeout(function() {
                    if (locked == true) {
                        mouseenter.call($this, e);
                    }
                }, delay);

            });
            $this.bind("mouseleave", function(e) {
                locked = false;
                mouseleave.call($this, e);
            });
        });
    };
})(jQuery);

//
// tabs jquery ext
//
(function($) {

    function changeTab(from, to){
                var id = to.id;
                if(from!=null){
                    $(from).removeClass("selected");
                    $("#"+from.id+"-content").hide();
                }
                $(to).addClass("selected");
                $("#"+to.id+"-content").show();
            }

    $.fn.tabs = function() {
        return this.each(function(){
            var $this = $(this);
            var selected = null;
            if($this.find(".tab.selected").length>0) {
               selected = $this.find(".tab.selected")[0];
            }
            var self = this;
            var publicInterface = {
                changeTab: function(target){
                    if(typeof target === "string")
                        target = document.getElementById(target);
                    changeTabInternal(target);
                },
                getCurrentTab: function(){
                    return selected;
                },
                getContainer: function() {
                    return self;
                }
            };
            $this.data("tabs_instance",publicInterface);
            $this.find(".tab").click(function(){
                    changeTabInternal(this);
                return false;
            });

            function changeTabInternal(target){
                changeTab(selected,target);
                $(self).trigger("tabChange",[target]);
                selected = target;
            }

        });
    };
})(jQuery);

function addEvent(elm, evType, fn, useCapture) {
    useCapture = useCapture || false;
    if (elm.addEventListener) {
        elm.addEventListener(evType, fn, false);
        return true;
    } else if (elm.attachEvent) {
        var r = elm.attachEvent('on' + evType, fn);
        return r;
    } else {
        elm['on' + evType] = fn;
    }
}

function removeEvent(elm, evType, fn, useCapture) {
    useCapture = useCapture || false;
	if (elm.removeEventListener){
        elm.removeEventListener(evType, fn, false);
    } else if (elm.detachEvent) {
    	 elm.detachEvent("on"+evType, fn);
    } else {
        delete elm["on"+evType];
    }
}

function $dc(className, type){
    type = type || "div";
    var ele = document.createElement(type);
    if(className)
        ele.className = className;
    return ele;
}
