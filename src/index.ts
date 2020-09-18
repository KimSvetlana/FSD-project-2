// import './ts-lib/sliderPlugin';
import $ from 'jquery';
global.jQuery = global.$ = $;
import './scss/style.scss';
import {SliderPlugin} from './ts-lib/sliderPlugin'

(function ($) {
    const pluginName = 'mySliderPlugin';

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
                $this.data(pluginName, new SliderPlugin($this, options));
            };

            return this.each(makeSliderFunction);
        },

        destroy : function() {
            let $this = $(this);
            let plugin = $this.data(pluginName) as SliderPlugin;
            return plugin.destroy();
        },

        disable : function() {
            let $this = $(this);
            let plugin = $this.data(pluginName) as SliderPlugin;
            return plugin.disable();
        },

        option : function(name:string, value:any) {
            if (value != undefined) {
                return this.each(function() {
                    let $this = $(this);
                    let plugin = $this.data(pluginName) as SliderPlugin; 
                    plugin.setOption(name, value);
                });
            }
            else {   
                let $this = this.first();
                let plugin = $this.data(pluginName) as SliderPlugin;       
                return plugin.getOption(name);
            }
        },

        value : function(val: number){  
            if (val != undefined) {
                return this.each(function() {
                    let $this = $(this);
                    let plugin = $this.data(pluginName) as SliderPlugin; 
                    plugin.setSliderValue(val);
                });
            }
            else {    
                let $this = this.first();
                let plugin = $this.data(pluginName) as SliderPlugin;       
                let values = plugin.getSliderValue();
                return values[1];
            }
        },

        values: function (val: any) {
            if (val != undefined) {
                return this.each(function () {
                    let maxValue = Math.max.apply(null, val);
                    let minValue = Math.min.apply(null, val);
                    let $this = $(this);
                    let plugin = $this.data(pluginName) as SliderPlugin;
                    plugin.setSliderValue( maxValue, minValue);
                });
            }
            else {
                let $this = this.first();
                let plugin = $this.data(pluginName) as SliderPlugin;
                return plugin.getSliderValue();
            }
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