$(function () {
    jQuery.validator.methods["date"]= function(value, element){
        return value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    }
    $(".form-validate").each(function(){
        var formid = $(this).attr("id");
        $("#"+formid).validate({
            errorPlacement: function(error, element){
                if(element.hasClass("datepicker") || element.hasClass("product-search-input")){
                    error.insertAfter(element.parent());
                }else{
                    error.insertAfter(element);
                }
            }
        });
    });
    $('a.ajax, .pagination a').live('click', function () {
      close_tool_tip();
      History.pushState(null, document.title, this.href);
      return false;
    });

    $('form.ajax[method="get"]').live("submit",function () {
        close_tool_tip();
        var action = $(this).attr('action');
        var params = formatFormFields(this);

        History.replaceState(null, document.title, action + "?" + params + "&ts="+ (new Date().getTime()));
        return false;
    });

    $('form.ajax[method="post"]').live("submit",function () {
        close_tool_tip();
        var action = $(this).attr('action');
        var params = formatFormFields(this);

        var gotop = true;
        if(params.indexOf("notop") != -1){
            gotop = false;
        }
        FKART.utils.loadScript(action,"post",params, gotop);
        return false;
    });

    $(".action-button").live("click",function(){
        $(this).closest("form").attr("action",$(this).attr("data-action-url")).submit();
    });

    History.Adapter.bind(window,'statechange',function(){
        var state = History.getState();
        FKART.utils.loadScript(state.url);
    });

    $(".fk-panel .fk-collapser").live("click",function(){
       var $panel = $(this).closest(".fk-panel");
       $(this).toggleClass("collapsed");
       $panel.find(".panel-body:first").slideToggle("fast");
    });

    $("#haction-links").bind("click",function(){
        $("#haction-link-id").addClass("selected");
        $("#alinks-list-id").css("display","block");
    });

    $("body").click(function(e){
        if((e.target.id != "haction-link-id") && (e.target.id != "haction-links")){
            $("#alinks-list-id").css("display","none");
            $("#haction-link-id").removeClass("selected");
        }
    });

    $(".copyclipboard").each(function(){
        var clip = new ZeroClipboard.Client();
        clip.setHandCursor( true );
        clip.setText($(this).prev().text());
        clip.glue(this);
    });
    
   	$('body').ajaxStart(function(){
	    close_tool_tip();
        FKART.utils.loader.show();
        $(".uiButton").each(function(){
            if($(this).hasClass("tresbtn")){
                disableButton(this,"tresdisabled");
            }else if(!$(this).hasClass("noglobal-hide")){
                //(this).addClass("ajaxdisabled").attr("disabled", true);
                disableButton(this,"ajaxdisabled");
            }
        });
        setTimeout(function(){
            enableButton("","ajaxdisabled");
            },1000);
	})
	
	$('body').ajaxStop(function(){
	    FKART.utils.loader.hide();
        enableButton("","ajaxdisabled");
        enableButton("","tresdisabled");
	});

    /* Hack for displaying selected field in browser */
    $(".fk-select-box").each(function(){
        $(this).val($(this).find('option[selected]').val());
    });

    $(".downloadcsv").live("click",function(){
        var num = $(this).parent().find("input").val();
        var pageurl = $(location).attr("href");
        pageurl = pageurl.replace("?", "/csv?");
        // pageurl.replace("/csv?", "/csv?");
        pageurl += (pageurl.indexOf("?") >= 0) ? "&" : "?";
        pageurl += "actiontype=download_csv&count="+num;
        window.location = pageurl;
     });

    $("input.uiButton.disabled").attr("disabled",true);
    date_handler();

    fk_table_handlers();
    global_ajax_errors();

    check_location_hash();
    clickdropdown();
});

function formatFormFields(formobj){
    var formparams = $(formobj).serializeArray();
    for(var i =0, len = formparams.length;i<len;i++){
        formparams[i]["value"] = $.trim(formparams[i]["value"]);
    }
    return $.param(formparams);
}
function disableButton(btnobj,classname){
    if(classname == undefined){
        $(btnobj).addClass("tresdisabled").attr("disabled",true);
    }else{
        $(btnobj).addClass(classname).attr("disabled",true);
    }
}
function enableButton(btnid,btnclass){
    if(btnid != undefined && btnid != ""){
        $("#"+btnid).removeClass("disabled").attr("disabled",false);
    }else if(btnclass != undefined){
        $(".uiButton."+btnclass).attr("disabled", false).removeClass(btnclass);
    }else{
        $("input.uiButton.disabled").attr("disabled", false).removeClass("disabled");
    }
}
function setupTableSorter(){
    $('table.fesortabletable').each(function (i, e) {
        var myHeaders = {};
        var mySortList = [];
        $(this).find('th.nosort').each(function (i, e) {
            myHeaders[$(this).index()] = { sorter: false };
        });
        $(this).find('th.firstsort').each(function (i, e) {
            var dir = $(this).attr("direction");
            var direction = 0;
            if(dir == "desc"){
                direction = 1;
            }

            mySortList[i] = [$(this).index(),direction];
        });

        $(this).tablesorter({
            headers: myHeaders,
            sortList:mySortList
        });
    });
}

function make_simple_ajax_call(url,method,params,callback, setheader){
    if (typeof(callback.success)!='function') {
            callback.success = function(resp) {};
    }
    if (typeof(callback.failure)=='function') {
            callback.failure = function(resp){};
    }
    if(setheader != undefined){
       $.ajax({
            beforeSend:function(xhrObj){
                xhrObj.setRequestHeader("Content-Type","application/csv");
                xhrObj.setRequestHeader("Accept","application/csv");
            },
            type:method,
            url:url,
            success:callback.success,
            error:callback.failure,
            data:params
       });
    }else{
        $.ajax({
            type:method,
            url:url,
            success:callback.success,
            error:callback.failure,
            data:params
        });
    }
}


function clickdropdown(){
    /* for keeping track of what's "open" */
    var activeClass = 'dropdown-active', showingDropdown, showingMenu, showingParent;
    var $container;
    /* hides the current menu */
    var flo_hideMenu = function() {
        if(showingDropdown) {
            showingDropdown.removeClass(activeClass);
            $container.remove();
            showingMenu.hide();
        }
    };

    /* recurse through dropdown menus */
    $('.fk-dropdown').each(function() {
        /* track elements: menu, parent */
        var flo_dropdown = $(this);
        var flo_menu = flo_dropdown.next('div.fk-dropdown-menu'), parent = flo_dropdown.parent();

        /* function that shows THIS menu */
        var flo_showMenu = function(this_obj) {
            flo_hideMenu();
            if($(".fk-dropdown-container").length == 0){
                $container = $(document.createElement("div")).addClass("fk-dropdown-container");
            }else{
                $container = $(".fk-dropdown-container");
            }
            showingDropdown = flo_dropdown.addClass('dropdown-active');
            flo_menu.appendTo($container);
            $container.appendTo("body");

            var near_element = $(this_obj).offset();
            var ne_left = near_element.left;
            if(near_element.top >0){
                var ne_top = near_element.top + $(this_obj).outerHeight() - 1;
            }else{
                var ne_top = $(this_obj).outerHeight() - 1;
            }

            var left =  ne_left;

            if((ne_left + $container.outerWidth()) >= $(window).width()){
                left = ((ne_left + $(this_obj).outerWidth()) - $container.outerWidth()) +1;

            }
            $container.css({'left': left,'top':ne_top});

            showingMenu = $container.show();
            showingParent = parent;
        };
        /* function to show menu when clicked */
        flo_dropdown.bind('click',function(e) {
            if(e) e.stopPropagation();
            if(e) e.preventDefault();
            flo_showMenu(this);
        });
        /* function to show menu when someone tabs to the box */
        flo_dropdown.bind('focus',function() {
            flo_showMenu(this);
        });
    });

    /* hide when clicked outside */
    $(document.body).bind('click',function(e) {
        if(showingParent) {
            var parentElement = showingParent[0];
            var clickedsec = $(parentElement).find(".fk-dropdown-menu");
            if(!$.contains(parentElement,e.target) || !parentElement == e.target || $.contains(clickedsec[0], e.target)) {
                flo_hideMenu();
            }
        }
    });
}

function close_tool_tip(){
    if($(".fk-ui-tooltip").hasClass("dont-close-tooltip")==false){
       $(".fk-ui-tooltip").css("display","none");
    }
}

function check_location_hash(){
    if(window.location.hash != ""){
        var state = History.getState();
        FKART.utils.loadScript(state.url);
    }
}

function date_handler(){
    $(".datepicker").bind("click",function(){
        if($(this).val() == "Start" || $("this").val() == "End"){
            $(this).val("");
        }
    });
    $(".datepicker").datepicker({
        dateFormat:'dd-mm-yy',
        showOn:"button",
        buttonImage:"/assets/ico-calendar.png",
        buttonImageOnly:true,
        showOn:"both"
    });

}



function global_ajax_errors(){
    $.ajaxSetup({
		error:function(x,e){
            var errortext = "";
            switch(x.status){
                case 0:
                    errortext = 'You are offline!! Please Check Your Network.';
                    break;
                case 401:
                    external_hideDialog();
                    pop_errortext = "You have been logged out. Please <a href='/logout'>login to check</a> this page";
                    errortext = "You have been logged out. Please login to check this page";
                    dialog = new FKART.ui.Dialog({
                        body : $("<div />").addClass("auth-meg").html(pop_errortext),
                        width : 600,
                        header : false,
                        showCloseIcon :false,
                        showFooter : false
                    });
                    dialog.show();
                    break;

                case 404:
                    errortext =  "Requested URL not found.";
                    break;
                case 500:
                    errortext = "Internal server error";
                    break;
                case 503:
                    errortext = "A dependent service failed to process your request. Please try again later";
                    break;
                default:
                    if(e == "parsererror"){
                        errortext = "Error. Parsing JSON request failed."
                    }else if(e == "timeout"){
                        errortext = "Request Time out";
                    }else{
                        errortext = "Unknown Error.";
                    }
                    break;
            }
            FKART.utils.fk_message.add(errortext, "error", "", 1000);
            FKART.utils.loader.hide();
            FKART.utils.toTop();
            enableButton("","tresdisabled");
		}
	});
}

function external_hideDialog(){
    $container = $(".fk-ui-dialog");
    if($container){
        $container.css("visibility","hidden");
        FKART.ui.isDialogOpen = false;

        $body = $(".fk-ui-dialog .dialog-body");
        $header = $(".fk-ui-dialog .dialog-header");
        if(FKART.ui.isDialogDataAjax){
            $body.children().empty().appendTo("body").css({"display": "none"});
        }else{
            $body.children().appendTo("body").css({"display": "none"});
        }
        if($header){
            $header.children().appendTo("body").css({"display": "none"});
        }
        FKART.ui.isDialogDataAjax = false;
        $container.remove();
    }
}

function fk_table_handlers() {
    $(".fk-table .table-toggle").live("click",function(){
            var $tbody = $(this).closest(".fk-table").find("tbody:first,.tbody:first");
            if( $(this).hasClass("collapsed") ) {
                $tbody.slideDown("fast");
                $(this).removeClass("collapsed")
            }  else {
                $tbody.slideUp("fast");
                $(this).addClass("collapsed")
            }
    });

    $(".fk-table-selectall").live("click",function(){
        $(this).closest(".fk-table").find(".fk-table-checkbox").attr("checked",!!$(this).attr("checked"));
        var theadclass = $(this).closest("thead").attr("class");
        if(theadclass == "tableFloatingHeader"){
            $(theadclass+"Original").trigger("click");
        }else{
            $(theadclass).trigger("click");
        }

        var value = null;
        select_all = $(".fk-table-selectall");
        $.each(select_all, function(intindex, object){
            if(value == null)
               value = object.value  == "true" ? "false" : "true";

            $(object).attr("value", value);
            $(object).attr("checked", value == "true" ? true : false);
        });
    });
    $(".fk-table-checkbox").live("click", function(){
        var selobj = $(this).closest(".fk-table").find(".fk-table-selectall");
        if(selobj.is(":checked") && this.checked == false){
            selobj.val(false);
            selobj.attr("checked", false);
        }
        if(this.checked == true){
            var parentid = $(this).closest("table").attr("id");
            CheckSelectAll(parentid);
        }
    });

    $(".sticky-header").stickyTableHeaders();
}

function CheckSelectAll(parentid){
    var flag = true;
    $("#"+parentid+" .fk-table-checkbox").each(function(){
        if(this.checked == false){
            flag = false;
        }
    });
    $("#"+parentid+" .fk-table-selectall").attr("checked", flag);
    $("#"+parentid+" .fk-table-selectall").val(flag);
}
function enable_sticky_headers(){
    $(".sticky-header").each(function(){
        if($(this).parent("div.divTableWithFloatingHeader").length <=0){
            $(this).stickyTableHeaders();
        }
    });
}

function make_ajax_pagination_call(url) {
	$.get(url)
}

var FKART = FKART || {};

FKART.utils = {};

FKART.utils.loadScript= function(url,method,params, gotop){
    method = method || "get";
    FKART.utils.loader.show();
    if(method == "get") {
        $.getScript(url, on_script_load);

    }   else {
        $.post(url,params,on_script_load,"script");
    }

    function on_script_load(){
        FKART.utils.loader.hide();
        if(gotop){
            FKART.utils.toTop();
        }
        enable_sticky_headers();
        $(document).trigger("script_loaded",[url, method]);
    }
};

FKART.utils.loader = {
    show:function(){
         if($("#global-loader").length == 0){
            $(document.body).append("<div id='global-loader' class='fk-global-loader'>Loading...</div>");
         }
         $("#global-loader").show();
         $(document.body).css("cursor","wait");
    },
    hide:function(){
        $("#global-loader").hide();
        $(document.body).css("cursor","default");
    }
};


FKART.utils.fk_message = {
    add:function(msg, type, action, time, divid){
        var msg_id = "global-message";
        if(divid != undefined){
            msg_id = divid;
        }
        //type can be : 'error', 'done', 'info'
        if(action == undefined || action == ""){
            $("#"+msg_id).removeClass().addClass("line msg "+type).empty().text(msg);
        }else if(action == "append"){
            $("#"+msg_id).removeClass().addClass("line msg "+type).append(msg);
        }
        if(time != undefined && time != ""){
            if(divid != undefined){
                $("#"+msg_id).show().fadeOut(time);
            }else{
                $("#"+msg_id).hide().fadeIn(time);
            }
        }
    },
    clear:function(divid){
        var msg_id = "global-message";
        if(divid != undefined){
            msg_id = divid;
        }
        $("#"+msg_id).empty();
    }
};

FKART.utils.resetForm = function(ele){
    $(ele).find(':input').each(function() {
       switch(this.type) {
           case 'password':
            case 'select-multiple':
            case 'select-one':
            case 'text':
            case 'textarea':
                $(this).val('');
                $(this).removeAttr('disabled');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;
                $(this).removeAttr('disabled');
                break;
            case 'hidden': 
                $(this).removeAttr('disabled');
                break;
	        }
	    });
};

FKART.utils.toTop = function() {
    $("html, body").animate({ scrollTop: 0 }, "fast");  //scrolls to top of page
};


function  _l(){
    if(typeof console!= "undefined"){
      console.log(arguments)
    }
}


$.fn.toggleCheckbox = function() {
    this.attr('checked', !this.attr('checked'));
};
