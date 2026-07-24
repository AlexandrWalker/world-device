/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'WDIconFont\'">' + entity + '</span>' + html;
	}
	var icons = {
		'icon-arrow-circle-inside': '&#xe900;',
		'icon-arrow-up-stroke': '&#xe901;',
		'icon-bento': '&#xe902;',
		'icon-cart': '&#xe903;',
		'icon-chevron-big': '&#xe904;',
		'icon-chevron-stroke': '&#xe905;',
		'icon-close': '&#xe906;',
		'icon-download': '&#xe907;',
		'icon-favorite': '&#xe908;',
		'icon-filter': '&#xe909;',
		'icon-galochka': '&#xe90a;',
		'icon-galochka-circle-inside': '&#xe90b;',
		'icon-glass-max': '&#xe90c;',
		'icon-glass-telegram': '&#xe90d;',
		'icon-headphones': '&#xe90e;',
		'icon-kebab': '&#xe90f;',
		'icon-list': '&#xe910;',
		'icon-login': '&#xe911;',
		'icon-max': '&#xe912;',
		'icon-nav-chevron-down': '&#xe913;',
		'icon-nav-max': '&#xe914;',
		'icon-nav-phone': '&#xe915;',
		'icon-nav-telegram': '&#xe916;',
		'icon-neuron': '&#xe917;',
		'icon-oformlenie': '&#xe918;',
		'icon-person': '&#xe919;',
		'icon-rating-star': '&#xe91a;',
		'icon-search': '&#xe91b;',
		'icon-share': '&#xe91c;',
		'icon-sravnenie': '&#xe91d;',
		'icon-telegram': '&#xe91e;',
		'icon-trade-in': '&#xe91f;',
		'icon-trash': '&#xe920;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
