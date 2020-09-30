import $ from 'jquery';
global.jQuery = global.$ = $;

import {SliderModel} from'./model'
import { View } from './view';
import {Controller} from './controller'

export class SliderPlugin {
    private _model: SliderModel;
    private _view: View;
    private _controller: Controller;
    private _options: object;

    constructor($this: JQuery, options: object) {
        this._options = options;
        this._model = new SliderModel(options);
        this._view = new View(this._model, options, $this);
        this._controller = new Controller(
            this._model, 
            this._view.minHandle.handleObject, 
            this._view.maxHandle.handleObject, 
            this._options, 
            this._view.sliderBar.getMinOffset(), 
            this._view.sliderBar.getMaxOffset(), 
            this._view.sliderBar.element);
        
        if (options.slideHandler) {
            this._model.slideEvent.subscribe(options.slideHandler);
        }
    }

    getOption(name: string) {
        switch (name) {
            case 'step':
                return this._model.step;
            case 'min':
                return this._model.getMinValue();
            case 'max':
                return this._model.getMaxValue();
        }
    }

    setOption(name: string, value: any) {
        switch (name) {
            case 'step':
                return this._model.step = value;
            
            case 'min': 
                return this._model.setMinValue(value);
            
            case 'max': 
                return this._model.setMaxValue(value);
            
            case 'indicatorVisibility':
                return this._view.indicator.setVisible(value);
            
            case 'scaleVisibility':
                return this._view.scale.setVisible(value);
            
            case 'backgroundColor':
                return this._view.colorRange.element.css('background-color', value);
        }
    }

    setSliderValue(val1: number, val2: number){
        return this._model.setSliderValue(val1, val2);
    }       
    
    getSliderValue(){   
        return this._model.getSliderValue();        
    }

    destroy(){
        return this._view.destroy();
    }

    disable(){
        this._view.colorRange.element.css('background-color', 'rgb(193, 208, 232)');
        return this._controller.disable();
    }

    enable(){
        this._view.colorRange.element.css('background-color', 'rgb(117, 156, 216)');
        return this._controller.enable();
    }
}
