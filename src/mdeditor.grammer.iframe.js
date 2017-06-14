mdeditor.addGrammar({
    reg: /^\$\[(.*?)\]\((.*?)\)\s*$/,
    handle: function (rows, i, that) {
        var row = rows[i];
        row = row.replace(that.reg, function (match, $1, $2) {
            var style = 'style="display:block;border:0;width:100%;';
            if ($1 !== '' && !isNaN($1)) {
                style += 'height:' + $1 + 'px"';
            }
            style += '"';
            return '<iframe class="mdeditor-iframe" src="' + $2 + '" ' + style + '></iframe>';
        });
        return {
            html: [row],
            index: i
        };
    }
});
