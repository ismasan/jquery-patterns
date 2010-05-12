/*
jQuery common patterns and functions
2008 Ismael Celis - www.estadobeta.com
Do whatever you want with this.
/*
Make sure that Rails interprets ajax requests as xhr
---------------------------------------------------------------*/
jQuery.ajaxSetup({
  	beforeSend: function(xhr) {
		xhr.setRequestHeader("Accept", "text/javascript");
	}
});

/*
Detect an element with given conditions passing an iterator function
USAGE (silly, because you can do this with a selector):

var e = $('div').detect( function(i){return i.attr('id') == 'blah'} );
--------------------------------------------------------------*/
(function($){
  $.fn.detect = function(it){
    var found = false;
    this.each(function(){
      if(it($(this))){found=$(this);return false};
    });
    return found;
  }
})(jQuery);
/*
Submits a link href via ajax, with optional method method.
- passing 'DELETE' would turn a GET into an http DELETE
USAGE:
<a href="/admin/contents/2" class="ajax_delete">delete</a>
$('a.ajax_delete').ajaxLink('DELETE')
----------------------------------------------------------------*/
(function($){
	$.fn.ajaxLink = function(method){
		$(this).click(function(){
			var url = $(this).attr('href')+'.js';
			var meth = method || 'get';
			var params = "_method="+meth;
			var t = meth == 'get' ? 'GET' : 'POST';
			$.ajax({
			   type: t,
			   url: url,
			   data: params,
			   dataType: 'script'
			 });
			return false;
		});
	}
})(jQuery);

/*
Forms submits themselves via Ajax.
- Serializes form fields
- Evals response. Ideal for RJS or injected behaviour. Keeps JS files light.
- add .js to action URL so the can be intercepted by Rails respond_to block.
USAGE:
<form class="ajax_form" action="...">...</form>
$('form.ajax_form').ajaxify();
------------------------------------------------------------------------------*/
(function($){
	$.fn.ajaxify = function(){
		$(this).submit(function(){
			var action = $(this).attr('action')+'.js';
			var params = $(this).serialize();
			//var meth = $(this).attr('method')
			$.ajax({
			   url: action,
			   data: params,
			   dataType: 'script',
			   type: 'POST'
			 });
			return false;
		});
	}
})(jQuery);
/*
Color fade
fades from one color to another
colors can be named (ie: 'green', 'red', 'white'), rgb ([255,240,240]) or hex ("#ee00ff")

DEPENDENCY: jquery.color.js

USAGE:
$('#some_element').colorFade({from:'red',to:'#eeffoo',speed:2000});

PARAMS:
from: 		fade from this color. Defaults to 'yellow'
to: 		fade to this color. Defaults to current color or white if not set
speed: 		fade speed in milliseconds. Defaults to 1000
---------------------------------------------*/
(function($){
	$.fn.colorFade = function(opts){
		var currentBg = $(this).css('backgroundColor');
		var o = $.extend({
			from: 'yellow',
			to: (currentBg=='transparent'?'white':currentBg),
			speed: 1000
		},opts || {});
		$(this).animate({ backgroundColor: o.from }, o.speed)
		.animate({ backgroundColor: o.to }, o.speed);
	}
})(jQuery);

/*
Super simple tabs.
tabifies the following structure:
 
<ul class="js_tabs">
  <li><a href="#area_1">Area 1</a></li>
  <li><a href="#area_2">Area 2</a></li>
</ul>
<div id="area_1">blah</div>
<div id="area_2">blih</div>
 
hides all but first div. Applies class="current" to first LI.
 
USAGE:
$('.js_tabs').tabify();
 
OPTIONS:
:: speed: speed in milliseconds to open panels
:: show: panel/tab to open on page load. Can be 'first' or a zero-based index.
:: close_link: an optional CSS selector for a link inside each panel that closes the panel
:: tab: selector for links to apply the behaviour to. Defaults to all links inside UL.
:: hide_self: (boolean) allow current link to hide it's target
----------------------------------------------------------------------------------------*/
(function($){
  $.tabify = function(elem,opts){
    var o = $.extend({
      speed: 0,
      show: 'first',
      close_link:false,
      tab: 'li a',
	  hide_self:true
    },opts);
    this.elem = elem;
    var self = this;
    var current = null;
    var links = this.elem.find(o.tab);
    var show = function(){
      if(current){
        hide(current,o.speed);
      }
      var is_current = (current!=null && current.attr('href') == $(this).attr('href'));
      if(o.hide_self && is_current){//close
        current = null;
        return false;
      }
      var target = $(this).attr('href');
      $(target).show(o.speed);
      $(this).parents('li').addClass('current');
      current = $(this);
      $(this).blur();
      return false;
    };
    var hide = function(a,s){
      var target = a.attr('href');
      $(target).hide(s);
      $(a).parents('li').removeClass('current');
    };
    $.each(links,function(){hide($(this),0)});
    links.click(show);
    if(links.length > 0 && o.show){
      var index = (o.show == 'first')?0:o.show;
      $(links[index]).trigger('click');
    }
    if(o.close_link){
      $.each(links,function(){
        var a = $(this);
        var close_link = $($(this).attr('href')+' '+o.close_link);
        close_link.click(function(){hide(a,0)});
      });
    }
  }
  $.fn.tabify = function(opts){
    $.each($(this),function(){
      new $.tabify($(this),opts);
    });
  }
})(jQuery);
/*
Links toggle visibility of element specified in href
USAGE:
<a href="#some_hidden_content" class="js_toggle_target">Show me the content</a>
<div id="some_hidden_content">This is the content</div>

$('a.js_toggle_target').toggleTarget();
----------------------------------------------------------------------------*/
(function($){
	$.fn.toggleTarget = function(){
		$(this).click(function(){
			var target = $($(this).attr('href'));
			target.toggle('fast');
			return false;
		});
	}
})(jQuery);
/*
We fake prototype's Insertion object so we can use Rails insert_html with all it's escaping goodness
------------------------------------------------------------------------------------------------------*/
var Insertion = {
	Bottom : function(id,html){
		$(id).append(html);
	},
	Top : function(id, html){
		$(id).prepend(html);
	}
}
var Element = {
	update : function(elem,content){
		$(elem).html(content);
	}
}

/*
Hover effect for links
- usage:
hides link targets in the document, applies hover effect to each link to show given target element.

Applies "current" CSS class to last A hovered.

<ul class="js_hover_gallery">
	<li><a rel="#box1">Box 1</a></li>
	<li><a rel="#box2">Box 2</a></li>
	<li><a rel="#box3">Box 3</a></li>
</ul>
<div id="box1" class="presenter_box">This is box 1</div>
<div id="box2" class="presenter_box">This is box 2</div>
<div id="box3" class="presenter_box">This is box 3</div>

$('.js_hover_gallery').hoverize();

You can pass an optional "onHover" calback. It receives the anchor tag and it's target as jQuery objects.

$('.js_hover_gallery').hoverize( 
	{
		onHover:function(a,target){
			alert(target);
		}
	} 
);
---------------------------------------------------------*/
;(function($){
	$.hoverize = function(element,opts){
		var elem = element;
		var links = elem.find('a');
		var current = null;
		var opts = $.extend($.hoverize.options,opts);
		
		var getTarget = function(a){
			return $(a.attr('rel'));
		};
		var hide = function(a){
			getTarget(a).hide();
			a.removeClass('current');
		};
		links.mouseover(function(){
			if(current)hide(current);
			current = $(this);
			current.addClass('current');
			getTarget(current).show()
			opts.onHover(current,getTarget(current));
		});
		links.each(function(){hide($(this))});
		if(links.length > 0)
			$(links[0]).trigger('mouseover');
	};
	$.hoverize.options = {
		onHover: function(a,target){}
	};
	// Each UL is an instance so we can have more than one per page
	$.fn.hoverize = function(opts){
		$(this).each(function(){
			new $.hoverize($(this),opts || {});
		});
	}
})(jQuery);

/*
Adjust column height to the highest in the group. 
Useful when we have HTML columns with variable content and we want to make sure all of them have equal heights.

$('div.columns').equalHeight();
---------------------------------------------------------*/
;(function($){
	
	$.fn.equalHeight = function(){
		var max_height = 0;
		$(this).each(function(){
			var h = $(this).height();
			if(h > max_height)max_height = h;
		});
		$(this).css('height',max_height+'px');
	}
})(jQuery);

/*
Placeholder text for your inputs, ie. search boxes

Only adds placeholder text to input if field is empty. Clears the input on focus.
Adds and removes CSS class "placeholder" to/from the input so you can style the placeholder state.

CSS:
input#search_field {color:#666}

Javascript:
$('input#search_field').placeholder('Use this box to search');
------------------------------------------------------*/
;(function($){
  $.fn.placeholder = function(placeholderValue){
    var $self = $(this);
    $self.focus(function() {
      if($(this).val() == placeholderValue) {
        $(this).removeClass('placeholder').val('');
      }
    }).blur(function(){
      if($(this).val() === '') {
        $(this).addClass('placeholder').val(placeholderValue);
      }
    }).parents('form').submit(function(){
      if($self.val() == placeholderValue) {
       $self.val('')
      }
    })
    
    $(this).trigger('blur');
  }
})(jQuery);