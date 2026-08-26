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
		'icon-cash': '&#xe931;',
		'icon-avito-icon': '&#xe900;',
		'icon-choice': '&#xe904;',
		'icon-security': '&#xe905;',
		'icon-economy': '&#xe906;',
		'icon-zoom': '&#xe907;',
		'icon-pay': '&#xe908;',
		'icon-car': '&#xe909;',
		'icon-view': '&#xe90a;',
		'icon-date': '&#xe90b;',
		'icon-lightning': '&#xe90c;',
		'icon-gis-icon': '&#xe90d;',
		'icon-yandex-icon': '&#xe90e;',
		'icon-galochka-circle-inside': '&#xe910;',
		'icon-galochka': '&#xe911;',
		'icon-chevron-stroke': '&#xe912;',
		'icon-download': '&#xe913;',
		'icon-oformlenie': '&#xe914;',
		'icon-arrow-circle-inside': '&#xe915;',
		'icon-arrow-up-stroke': '&#xe916;',
		'icon-bento': '&#xe917;',
		'icon-cart': '&#xe918;',
		'icon-chevron-big': '&#xe919;',
		'icon-close': '&#xe91a;',
		'icon-favorite': '&#xe91b;',
		'icon-filter': '&#xe91c;',
		'icon-glass-max': '&#xe91d;',
		'icon-glass-telegram': '&#xe91e;',
		'icon-headphones': '&#xe91f;',
		'icon-kebab': '&#xe920;',
		'icon-list': '&#xe921;',
		'icon-login': '&#xe922;',
		'icon-max': '&#xe923;',
		'icon-nav-chevron-down': '&#xe924;',
		'icon-nav-max': '&#xe925;',
		'icon-nav-phone': '&#xe926;',
		'icon-nav-telegram': '&#xe927;',
		'icon-neuron': '&#xe928;',
		'icon-person': '&#xe929;',
		'icon-rating-star': '&#xe92a;',
		'icon-search': '&#xe92b;',
		'icon-share': '&#xe92c;',
		'icon-sravnenie': '&#xe92d;',
		'icon-telegram': '&#xe92e;',
		'icon-trade-in': '&#xe92f;',
		'icon-trash': '&#xe930;',
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
