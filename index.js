var postcss = require('postcss');
var units = require('units-css');
var parseCssFont = require('parse-css-font');
var assign = require('object-assign');

module.exports = postcss.plugin('postcss-increase-text-size', function(opts) {
    opts = assign(
        {
            fontSizeMultiplyBy: 1.2,
            selectorsBlackList: [],
        },
        opts,
    );

    function propInArray(array, prop) {
        return array.indexOf(prop) > -1;
    }

    return function(css, result) {
        css.walkDecls(function(decl) {
            if (propInArray(opts.selectorsBlackList, decl.parent.selector)) {
                return;
            }

            var shouldUpdateLineHeight = !!opts.lineHeightMultiplyBy;
            if (decl.prop === 'font') {
                var fontValue = parseCssFont(decl.value);
                var fontSize = units.parse(fontValue.size);
                var lineHeight = fontValue.lineHeight;
                var fontValueCon;

                if (fontSize.unit === 'em' || fontSize.unit === 'rem') {
                    fontSize = fontSize.value * opts.fontSizeMultiplyBy + fontSize.unit;
                } else {
                    fontSize = Math.round(fontSize.value * opts.fontSizeMultiplyBy) + fontSize.unit;
                }

                if (lineHeight !== 'normal' && shouldUpdateLineHeight) {
                    var newlineHeight = units.parse(lineHeight);

                    if (newlineHeight.unit === 'em' || newlineHeight.unit === 'rem') {
                        newlineHeight =
                            newlineHeight.value * opts.lineHeightMultiplyBy + newlineHeight.unit;
                    } else {
                        newlineHeight =
                            Math.round(newlineHeight.value * opts.lineHeightMultiplyBy) +
                            newlineHeight.unit;
                    }

                    fontValueCon = fontSize + '/' + newlineHeight;
                } else {
                    fontValueCon = fontSize;
                }

                decl.value = decl.value.replace(/(\d\S*)(\d+)?/g, fontValueCon);
            }

            if (decl.prop === 'font-size') {
                var propUnit = units.parse(decl.value);

                if (propUnit.unit === 'em' || propUnit.unit === 'rem') {
                    propUnit.value *= opts.fontSizeMultiplyBy;
                } else {
                    propUnit.value = Math.round(propUnit.value * opts.fontSizeMultiplyBy);
                }

                decl.value = propUnit.value + propUnit.unit;
            }

            if (decl.prop === 'line-height' && shouldUpdateLineHeight) {
                var propUnit = units.parse(decl.value);
                if (propUnit.unit === 'em' || propUnit.unit === 'rem') {
                    propUnit.value *= opts.lineHeightMultiplyBy;
                } else {
                    propUnit.value = Math.round(propUnit.value * opts.lineHeightMultiplyBy);
                }
                decl.value = propUnit.value + propUnit.unit;
            }
        });
    };
});
