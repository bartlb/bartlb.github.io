/**
 * Some notes:
 * - This application is used strictly for the purposes of redesigning the interface for
 *   resrc.io. It does not act as a in an attempt to subvert, replace, or even fork the
 *   community project hosted by @vhf (https://github.com/vhf/free-programming-books).
 * - Cross-domain (i.e. github.com <-> github.io) accomplished with jQuery.getJSON() and
 *   the Whatever Origin open-source proxy server (http://whateverorigin.org).
 * 
 * @author  bartlb
 * @license WTFPL (http://wtfpl.net/about/)
 */
var GH_ProxyURL = (function () {
  return 'http://whateverorigin.org/get?url=' +
         encodeURIComponent(
           'http://github.com/vhf/free-programming-books' +
           '/blob/master/free-programming-books.md'
         ) + '&callback=?';
}());

var MD_RAKE = (function ($) {
  var md_rake = { categories: {} };

  $.getJSON(GH_ProxyURL, function (data) {
    var md_body       = $(data.contents).find('article.markdown-body.entry-content'),
        md_categories = md_body.children('h3:eq(0)').siblings('h3:lt(4)'),
        md_langIndex  = md_body.children('h3:gt(4)');

    var DocObject     = (function (elm) {
      var re = /.*\.pdf$/;

      this.text = $(elm).children('a').text().trim();
      this.href = $(elm).children('a').attr('href');
      this.type = re.exec(this.href) ? 'PDF' : 'HTML';
    });

    var ModuleObject  = (function (header) {
      this.label = header.innerText.trim();
      this.docs  = getDocList(header);
    });

    function getDocList(header) {
      var dlist = $(header).nextUntil('h3, h4', 'ul').children('li').toArray();

      dlist.forEach(function (val, idx, ref) {
        ref[idx] = new DocObject(val);
      });
      return dlist.length ? dlist : 0;
    }

    function getModuleList(category /*, selector='h3', filter='h4' */) {
      var nu_select = (arguments[1] ? arguments[1] : 'h3'),
          nu_filter = (arguments[2] ? arguments[2] : 'h4');
      var mlist     = $(category).nextUntil(nu_select, nu_filter).toArray();

      return mlist.forEach(function (val, idx, ref) {
        ref[idx] = new ModuleObject(val);
      }), (mlist.length ? mlist : 0);
    }

    md_categories.each(function (index, elm) {
      md_rake.categories[elm.innerText.trim()] = {
        docs:     getDocList(elm),
        modules:  getModuleList(elm)
      };
    });

    md_rake.categories['Language Index'] = (function () {
      var langs = {};
      md_langIndex.each(function (index, elm) {
        langs[elm.innerText.trim()] = {
          docs:     getDocList(elm),
          modules:  getModuleList(elm)
        };
      });
      return langs;
    }());   
  });

  return md_rake;
})(jQuery);