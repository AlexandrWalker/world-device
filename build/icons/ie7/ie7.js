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
		'icon-arrow': '&#xe900;',
		'icon-pay': '&#xe901;',
		'icon-cash': '&#xe902;',
		'icon-avito-icon': '&#xe903;',
		'icon-choice': '&#xe907;',
		'icon-security': '&#xe908;',
		'icon-economy': '&#xe909;',
		'icon-zoom': '&#xe90a;',
		'icon-car': '&#xe90b;',
		'icon-view': '&#xe90c;',
		'icon-date': '&#xe90d;',
		'icon-lightning': '&#xe90e;',
		'icon-gis-icon': '&#xe90f;',
		'icon-yandex-icon': '&#xe910;',
		'icon-galochka-circle-inside': '&#xe912;',
		'icon-galochka': '&#xe913;',
		'icon-chevron-stroke': '&#xe914;',
		'icon-download': '&#xe915;',
		'icon-oformlenie': '&#xe916;',
		'icon-arrow-circle-inside': '&#xe917;',
		'icon-arrow-up-stroke': '&#xe918;',
		'icon-bento': '&#xe919;',
		'icon-cart': '&#xe91a;',
		'icon-chevron-big': '&#xe91b;',
		'icon-close': '&#xe91c;',
		'icon-favorite': '&#xe91d;',
		'icon-filter': '&#xe91e;',
		'icon-glass-max': '&#xe91f;',
		'icon-glass-telegram': '&#xe920;',
		'icon-headphones': '&#xe921;',
		'icon-kebab': '&#xe922;',
		'icon-list': '&#xe923;',
		'icon-login': '&#xe924;',
		'icon-max': '&#xe925;',
		'icon-nav-chevron-down': '&#xe926;',
		'icon-nav-max': '&#xe927;',
		'icon-nav-phone': '&#xe928;',
		'icon-nav-telegram': '&#xe929;',
		'icon-neuron': '&#xe92a;',
		'icon-person': '&#xe92b;',
		'icon-rating-star': '&#xe92c;',
		'icon-search': '&#xe92d;',
		'icon-share': '&#xe92e;',
		'icon-sravnenie': '&#xe92f;',
		'icon-telegram': '&#xe930;',
		'icon-trade-in': '&#xe931;',
		'icon-trash': '&#xe932;',
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
