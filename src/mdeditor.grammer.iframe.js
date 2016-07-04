mdeditor && mdeditor.addGrammar && mdeditor.addGrammar({
    reg: /^\$\[(.*?)\]\((.*?)\)$/,
    handle: function (rows, i) {
        var row = rows[i];
        row = row.replace(this.reg, function (match, $1, $2) {
            var style = "";
            if ($1 != '' && !isNaN($1)) {
                style = 'style="height:' + $1 + 'px"';
            }
            return '<iframe class="mdeditor-iframe" src="' + $2 + '" ' + style + '></iframe>';
        });
        return {
            html: [row],
            start: i
        }
    }
});
