$(function () {
  var MD_RAKE = (function ($) {
    var md_rake = { categories: {} };

    $.get('/vhf/free-programming-books/blob/master/free-programming-books.md', function (data) {
      var md_body       = $(data).find('article.markdown-body.entry-content'),
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
}());