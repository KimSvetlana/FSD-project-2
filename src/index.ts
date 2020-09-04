// import './ts-lib/sliderPlugin';
import $ from 'jquery';
global.jQuery = global.$ = $;
import './scss/style.scss';
import {SliderModel} from'./ts-lib/model'
import { View } from './ts-lib/view';
import {Controller} from './ts-lib/controller'

(function ($) {
    let methods = {
        init : function (options) {
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
                let model = new SliderModel(options);
                let view = new View(model, options, $this);
                let controller = new Controller(
                    model, 
                    view.minHandle.handleObject, 
                    view.maxHandle.handleObject, 
                    options, 
                    view.sliderBar.getMinOffset(), 
                    view.sliderBar.getMaxOffset(), 
                    view.sliderBar.element);
            };

            return this.each(makeSliderFunction);
        },

        destroy : function() {

        }


    };

    $.fn.mySliderPlugin = function (method){
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
          } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
          } else {
            $.error( 'Метод ' +  method + ' не существует в jQuery.mySliderPlugin' );
          }   
    };

})(jQuery);