// import './ts-lib/sliderPlugin';
import $ from 'jquery';
global.jQuery = global.$ = $;
import './scss/style.scss';
import {SliderModel} from'./ts-lib/model'
import { View } from './ts-lib/view';

(function ($) {
    $.fn.mySliderPlugin = function (options) {
        // настройки по умолчанию
        options = $.extend({
            backgroundColor: '#759cd8',
            expansion: '100%',
            thickness: 8,
            min: -100,
            max: 100,
            step: 5,
            scaleOfValues: false,
            scaleDivision: 5,
            isDouble: false,
            vertical: false,
            indicatorVisibility: false,
            slideHandler: null,
        }, options);

        const makeSliderFunction = function () {

            let $this = $(this);
            let model = new SliderModel();
            let view = new View(model, options, $this);
            let controller = new Object();
        };

    return this.each(makeSliderFunction);
};

})(jQuery);