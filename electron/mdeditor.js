    var mdeditor = function(options) {
      return new mdeditor.prototype.init(options);
    };
    mdeditor.prototype = {
      constructor: mdeditor,
      init: function(options) {
        var me = this;
        var defaults = {
          id: '',
          placeholder: '',
          name: '',
          aTarget: '_blank'
        };
        if (options && options.id) {

          me.copy(defaults, options);

          var wrap = this.getDom(options.id);

          var html =
            '<textarea id="mdeditor" class="mdeditor" name="{{name}}" placeholder="{{placeholder}}"></textarea><div id="mdeditor-html" class="mdeditor-html"></div>';

          html = me.formatString(html, defaults);
          wrap.innerHTML = html;

          var editor = this.getDom('mdeditor');
          var editor2Html = this.getDom('mdeditor-html');

          editor.addEventListener('input', function() {
            var txt = this.value;
            me.markdownToHtml(txt);
          });
          var mousePosition = '';
          editor.addEventListener('scroll', function() {
            if (mousePosition == 'editor') {
              editor2Html.scrollTop = editor.scrollTop / (editor.scrollHeight -
                editor.clientHeight) * (editor2Html.scrollHeight -
                editor2Html.clientHeight);
            }
          });
          editor2Html.addEventListener('scroll', function() {
            if (mousePosition == 'editor2Html') {
              editor.scrollTop = editor2Html.scrollTop / (editor2Html.scrollHeight -
                editor2Html.clientHeight) * (editor.scrollHeight -
                editor.clientHeight);
            }
          });
          editor.addEventListener('mousemove', function(e) {
            mousePosition = 'editor';
          });
          editor2Html.addEventListener('mousemove', function() {
            mousePosition = 'editor2Html';
          });
          me.editor = editor;
          me.editor2Html = editor2Html;
        }
        me.options = defaults;
        return me;
      },

      regLib: {
        code: /^\`{3}.*$/,
        ul: /^[\.\-\*]\s+.+$/,
        ol: /^\d+\.\s?.+$/,
        toc: /^\s*\[TOC\]\s*$/,
        img: /\!\[(.*?)\]\((.*?)\)/g,
        title: /^#{1,6}.+$/,
        a: /\[(.*?)\]\((.*?)\)/g,
        b: /\*\*(.+?)\*\*/g,
        inline_code: /\`(.+?)\`/g,
        table: /^(\|[^|]+)+\|$/,
        table_td_align: /^(\|\s*:?-+:?\s*)+\|$/,
        table_td_align_left: /^\s*:-+\s*$/,
        table_td_align_center: /^\s*:-+:\s*$/,
        table_td_align_right: /^\s*-+:\s*$/
      },

      formatString: function(format, data) {
        return format.replace(/{{(\w+)}}/g, function(m, c) {
          return data[c];
        });
      },

      copy: function(source, dest) {
        for (var name in dest) {
          source[name] = dest[name];
        }
        return source;
      },

      getDom: function(_id) {
        return document.getElementById(_id);
      },

      getMarkdown: function() {
        if (this.editor) {
          return this.editor.value;
        } else {
          return null;
        }
      },

      setMarkdown: function(markdown) {
        if (this.editor) {
          this.editor.value = markdown;
        }
        return this.markdownToHtml(markdown);
      },

      getHTML: function() {
        if (this.editor2Html) {
          return this.editor2Html.innerHTML;
        } else {
          return '';
        }
      },

      markdownToHtml: function(md) {
        var me = this;
        var rows = md.match(/.+/mg) || [];
        var html = [];
        var flag = '';
        var codeType = '';
        var rowsCount = rows.length;
        var rowsStart = 0;
        var toc = null;
        var tdAlign = [];
        if (rowsCount && me.regLib.toc.test(rows[0])) {
          rowsStart = 1;
          toc = ['<div class="mdeditor-toc">'];
        }
        for (var i = rowsStart; i < rowsCount; i++) {
          var row = rows[i];
          row = me.replaceHtmlTag(row);
          switch (flag) {
            case 'ol':
              if (!me.regLib.ol.test(row)) {
                i--;
                flag = '';
                html.push('</ol>');
              } else {
                html.push(me.handleOrderList(row));
                if (i == rowsCount - 1) {
                  html.push('</ol>');
                }
              }
              break;
            case 'ul':
              if (!me.regLib.ul.test(row)) {
                i--;
                flag = '';
                html.push('</ul>');
              } else {
                html.push(me.handleUnorderedList(row));
                if (i == rowsCount - 1) {
                  html.push('</ul>');
                }
              }
              break;
            case 'code':
              if (me.regLib.code.test(row)) {
                flag = '';
                html.push('</code>');
                html.push('</pre>');
              } else {
                html.push('<li><div>' + me.handleCodeType(codeType, row) +
                  '</div></li>');
              }
              break;
            case 'table':
              if (!me.regLib.table.test(row)) {
                i--;
                flag = '';
                html.push('</table>');
              } else {
                html.push(me.handleTr(row, tdAlign));
                if (i == rowsCount - 1) {
                  html.push('</table>');
                }
              }
              break;
            default:
              if (me.regLib.title.test(row)) {
                html.push(me.handleTitle(row, toc));
              } else if (me.regLib.ol.test(row)) {
                i--;
                flag = 'ol';
                html.push('<ol  class="mdeditor-ol">');
              } else if (me.regLib.ul.test(row)) {
                i--;
                flag = 'ul';
                html.push('<ul  class="mdeditor-ul">');
              } else if (me.regLib.code.test(row)) {
                flag = 'code';
                codeType = row.replace(/[`\s]/g, '');
                html.push('<pre class="mdeditor-code mdeditor-code-' +
                  codeType.toLowerCase() + '">');
                html.push('<ol>');
              } else if (me.regLib.table.test(row)) {
                if (i != rowsCount - 1 && me.regLib.table_td_align.test(
                    rows[i + 1])) {
                  flag = 'table';
                  html.push('<table class="mdeditor-table"><tr>');
                  var tdArr = row.match(/[^|]+/g);
                  tdAlign = me.handleTdAlign(rows[i + 1]);
                  for (var m = 0, n = tdArr.length; m < n; m++) {
                    html.push('<th style="text-align:' + tdAlign[m] + '">' +
                      tdArr[m] + '</th>');
                  }
                  html.push('</tr>');
                  i++;
                  if (i == rowsCount - 1) {
                    html.push('</table>');
                  }
                } else {
                  html.push(me.handleParagraph(row));
                }
              } else {
                html.push(me.handleParagraph(row));
              }
              break;
          }
        }

        html = (toc ? toc.join('') + '</div>' : '') + html.join('');

        if (this.editor2Html) {
          this.editor2Html.innerHTML = html;
        }
        return html;
      },

      handleTr: function(txt, align) {
        var arr = txt.match(/[^|]+/g);
        var tr = '<tr>';
        for (var i = 0, j = arr.length; i < j; i++) {
          tr += '<td style="text-align:' + align[i] + '">' + this.handleInlineSet(
            arr[i]) + '</td>';
        }
        tr += '</tr>';
        return tr;
      },

      handleTdAlign: function(txt) {
        var arr = txt.match(/[^|]+/g);
        var align = [];
        for (var i = 0, j = arr.length; i < j; i++) {
          if (this.regLib.table_td_align_right.test(arr[i])) {
            align.push('right');
          } else if (this.regLib.table_td_align_center.test(arr[i])) {
            align.push('center');
          } else {
            align.push('left');
          }
        }
        return align;
      },

      handleTitle: function(txt, toc) {
        var me = this;
        return txt.replace(/(#{1,6})(.+)/, function(match, $1, $2) {
          var hno = $1.length;
          if (toc) {
            toc.push('<a class="mdeditor-toc-' + hno + '" href="#' + $2 +
              '">' + $2 + '</a>');
          }
          return '<h' + hno + ' id="' + $2 + '" >' + $2 + '</h' + hno +
            '>';
        });
      },

      handleParagraph: function(txt) {
        return '<p>' + this.handleInlineSet(txt) + '</p>';
      },

      handleInlineSet: function(txt) {
        txt = this.handleImg(txt);
        txt = this.handleInlineCode(txt);
        txt = this.handleLink(txt);
        txt = this.handleBold(txt);
        return txt;
      },

      handleImg: function(txt) {
        return txt.replace(this.regLib.img, function(match, $1, $2) {
          return '<img class="mdeditor-img" alt="' + $1 + '" src="' +
            $2 + '">';
        });
      },

      handleLink: function(txt) {
        var me = this;
        return txt.replace(me.regLib.a, function(txt, $1, $2) {
          $1 = me.handleBold($1);
          return '<a href="' + $2 + '" target="' + me.options.aTarget +
            '">' + $1 + '</a>';
        });
      },

      handleBold: function(txt) {
        var me = this;
        return txt.replace(me.regLib.b, function(match, $1) {
          return '<b>' + $1 + '</b>';
        });
      },

      handleInlineCode: function(txt) {
        var me = this;
        return txt.replace(me.regLib.inline_code, function(txt, $1) {
          return '<span class="mdeditor-inline-code">' + $1 + '</span>';
        });
      },

      handleUnorderedList: function(txt) {
        txt = txt.replace(/^[\.\*\-]\s*/, '');
        txt = this.handleInlineSet(txt);
        return '<li>' + txt + '</li>';
      },

      handleOrderList: function(txt) {
        txt = txt.replace(/^\d+\.\s*/, '');
        txt = this.handleInlineSet(txt);
        return '<li>' + txt + '</li>';
      },

      /* 高亮各种代码类型 */
      handleCodeType: function(codeType, txt) {
        switch (codeType) {
          case 'javascript':
            return this.highlightJs(txt);
          case 'css':
            return txt.replace(/([a-zA-Z-]+:)([^;\{]+)(;)/g,
              '<span class="css-property-name">$1</span><span class="css-property-value">$2</span><span class="css-semicolon">$3</span>'
            );
          case 'xml':
            return txt.replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g,
              '<span class="xml-lt">$1</span><span class="xml-tag-name">$2</span><span class="xml-tag-attr">$3</span><span class="xml-gt">$4</span>'
            );
          default:
            return txt;
        }
      },

      highlightJs: function(txt) {
        var keywords = ['break',
          'case', 'catch', 'continue',
          'default', 'delete', 'do',
          'else', 'finally', 'for', 'function',
          'if', 'in', 'instanceof',
          'new',
          'return',
          'switch',
          'this', 'throw', 'try', 'typeof',
          'var', 'void',
          'while', 'with'
        ];

        var keywordReg = new RegExp('\\b(' + keywords.join('|') + ')\\b',
          'g');
        return txt.replace(/('|").*?('|")/g, function(v) {
          return '<span class="js-string">' + v + '</span>';
        }).replace(keywordReg, function(v) {
          return '<span class="js-keyword">' + v + '</span>';
        }).replace(/\/\/.+$/, function(v) {
          return '<span class="js-line-comment">' + v + '</span>';
        });


      },

      replaceHtmlTag: function(txt) {
        return txt.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
      }
    };
    mdeditor.prototype.init.prototype = mdeditor.prototype;

    module.exports = mdeditor;
