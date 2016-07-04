mdeditor && mdeditor.addGrammar && mdeditor.addGrammar({
    reg: /^\$\[(.*?)\]\((.*?)\)\s*$/,
    handle: function (rows, i, that) {
        var row = rows[i];
        row = row.replace(that.reg, function (match, $1, $2) {
            var style = "";
            if ($1 != '' && !isNaN($1)) {
                style = 'style="display:block;border:0;width:100%;height:' + $1 + 'px"';
            }
            return '<iframe class="mdeditor-iframe" src="' + $2 + '" ' + style + '></iframe>';
        });
        return {
            html: [row],
            index: i
        }
    }
});
