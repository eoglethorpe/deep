var highlighter = {};

(function(context) {
    context.highlightHtml = function(html, searchFor, spanAttributes) {
        if (searchFor.trim().length > 0) {
            // Get words and form regex to search them, including whitespaces and tags
            var words = searchFor.match(/\S+/g);
            var re = "";
            for (var i=0; i<words.length; ++i) {
                // Remember to escape characters
                re += words[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                if (i < words.length - 1) {
                    re += "\\s*(\\s*<[^>]*>)*\\s*";
                }
            }

            // Match the regex
            re = new RegExp(re);
            var match = re.exec(html);

            // If match was found, highlight it
            if (match) {
                var content = match[0];
                // Start a span tag at the beginning
                var output = '<span ' + spanAttributes + '>';
                // Find index of next tag and end the span tag just before that
                // and repeat doing this
                var restStr = content.slice(0);
                var index = 0;
                var m;
                while (m = /\s*<[^>]*>/.exec(restStr)) {
                    output += restStr.slice(0, m.index) + '</span>';
                    // Also start span tag just after the tag
                    output += m[0] + '<span ' + spanAttributes + '>';
                    restStr = restStr.slice(m.index + m[0].length);
                }
                
                // End the final span tag
                output += restStr + '</span>';


                // Replace the html with highlighted content and return that
                return html.slice(0, match.index) + output + html.slice(match.index + content.length)
            }
        }

        // Just return the original text if no match was found
        return html;

    }
}(highlighter));
