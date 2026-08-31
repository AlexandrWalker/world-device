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
		'icon-pay': '&#xe900;',
		'icon-cash': '&#xe901;',
		'icon-avito-icon': '&#xe902;',
		'icon-choice': '&#xe906;',
		'icon-security': '&#xe907;',
		'icon-economy': '&#xe908;',
		'icon-zoom': '&#xe909;',
		'icon-car': '&#xe90a;',
		'icon-view': '&#xe90b;',
		'icon-date': '&#xe90c;',
		'icon-lightning': '&#xe90d;',
		'icon-gis-icon': '&#xe90e;',
		'icon-yandex-icon': '&#xe90f;',
		'icon-galochka-circle-inside': '&#xe911;',
		'icon-galochka': '&#xe912;',
		'icon-chevron-stroke': '&#xe913;',
		'icon-download': '&#xe914;',
		'icon-oformlenie': '&#xe915;',
		'icon-arrow-circle-inside': '&#xe916;',
		'icon-arrow-up-stroke': '&#xe917;',
		'icon-bento': '&#xe918;',
		'icon-cart': '&#xe919;',
		'icon-chevron-big': '&#xe91a;',
		'icon-close': '&#xe91b;',
		'icon-favorite': '&#xe91c;',
		'icon-filter': '&#xe91d;',
		'icon-glass-max': '&#xe91e;',
		'icon-glass-telegram': '&#xe91f;',
		'icon-headphones': '&#xe920;',
		'icon-kebab': '&#xe921;',
		'icon-list': '&#xe922;',
		'icon-login': '&#xe923;',
		'icon-max': '&#xe924;',
		'icon-nav-chevron-down': '&#xe925;',
		'icon-nav-max': '&#xe926;',
		'icon-nav-phone': '&#xe927;',
		'icon-nav-telegram': '&#xe928;',
		'icon-neuron': '&#xe929;',
		'icon-person': '&#xe92a;',
		'icon-rating-star': '&#xe92b;',
		'icon-search': '&#xe92c;',
		'icon-share': '&#xe92d;',
		'icon-sravnenie': '&#xe92e;',
		'icon-telegram': '&#xe92f;',
		'icon-trade-in': '&#xe930;',
		'icon-trash': '&#xe931;',
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
