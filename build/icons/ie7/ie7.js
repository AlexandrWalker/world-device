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
		'icon-view': '&#xe901;',
		'icon-date': '&#xe902;',
		'icon-lightning': '&#xe900;',
		'icon-galochka-circle-inside': '&#xe904;',
		'icon-galochka': '&#xe905;',
		'icon-chevron-stroke': '&#xe906;',
		'icon-download': '&#xe907;',
		'icon-oformlenie': '&#xe908;',
		'icon-arrow-circle-inside': '&#xe909;',
		'icon-arrow-up-stroke': '&#xe90a;',
		'icon-bento': '&#xe90b;',
		'icon-cart': '&#xe90c;',
		'icon-chevron-big': '&#xe90d;',
		'icon-close': '&#xe90e;',
		'icon-favorite': '&#xe90f;',
		'icon-filter': '&#xe910;',
		'icon-glass-max': '&#xe911;',
		'icon-glass-telegram': '&#xe912;',
		'icon-headphones': '&#xe913;',
		'icon-kebab': '&#xe914;',
		'icon-list': '&#xe915;',
		'icon-login': '&#xe916;',
		'icon-max': '&#xe917;',
		'icon-nav-chevron-down': '&#xe918;',
		'icon-nav-max': '&#xe919;',
		'icon-nav-phone': '&#xe91a;',
		'icon-nav-telegram': '&#xe91b;',
		'icon-neuron': '&#xe91c;',
		'icon-person': '&#xe91d;',
		'icon-rating-star': '&#xe91e;',
		'icon-search': '&#xe91f;',
		'icon-share': '&#xe920;',
		'icon-sravnenie': '&#xe921;',
		'icon-telegram': '&#xe922;',
		'icon-trade-in': '&#xe923;',
		'icon-trash': '&#xe924;',
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
